import type { Pool } from "pg";
import GraphQLJSON from "graphql-type-json";

export type GqlContext = { pool: Pool };

type PushEventInput = {
  eventId: string;
  collectionId: string;
  entityType: string;
  entityId: string;
  op: string;
  payload: unknown;
  clientTs: string;
  actorUserId: string;
};

export const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    health: async (_: unknown, __: unknown, ctx: GqlContext) => {
      await ctx.pool.query("SELECT 1");
      return "ok";
    },

    pullChanges: async (
      _: unknown,
      args: {
        input: {
          deviceId: string;
          sinceCursor: string;
          collectionIds: string[];
        };
      },
      ctx: GqlContext
    ) => {
      const { sinceCursor, collectionIds } = args.input;
      const sinceStr = sinceCursor?.trim() || "0";
      try {
        BigInt(sinceStr);
      } catch {
        throw new Error("sinceCursor non numerico");
      }

      if (!collectionIds.length) {
        return { nextCursor: sinceStr, changes: [] as unknown[] };
      }

      const result = await ctx.pool.query<{
        cursor: string;
        collection_id: string;
        entity_type: string;
        entity_id: string;
        op: string;
        payload: unknown;
        server_ts: Date;
      }>(
        `SELECT cursor::text AS cursor, collection_id::text, entity_type, entity_id::text, op, payload, server_ts
         FROM changes
         WHERE cursor > $1::bigint AND collection_id = ANY($2::uuid[])
         ORDER BY cursor ASC
         LIMIT 200`,
        [sinceStr, collectionIds]
      );

      const rows = result.rows;
      const nextCursor =
        rows.length > 0 ? rows[rows.length - 1].cursor : sinceStr;

      return {
        nextCursor,
        changes: rows.map((r: (typeof rows)[number]) => ({
          collectionId: r.collection_id,
          entityType: r.entity_type,
          entityId: r.entity_id,
          op: r.op,
          payload: r.payload,
          serverTs: r.server_ts.toISOString(),
          serverCursor: r.cursor,
        })),
      };
    },
  },

  Mutation: {
    pushEvents: async (
      _: unknown,
      args: { input: { deviceId: string; events: PushEventInput[] } },
      ctx: GqlContext
    ) => {
      const { deviceId, events } = args.input;
      const acks: { eventId: string; status: string; reason?: string }[] = [];

      const client = await ctx.pool.connect();
      try {
        await client.query("BEGIN");

        for (const ev of events) {
          try {
            const ins = await client.query(
              `INSERT INTO sync_events (event_id, device_id, actor_user_id, collection_id)
               VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid)
               ON CONFLICT (event_id) DO NOTHING
               RETURNING event_id`,
              [ev.eventId, deviceId, ev.actorUserId, ev.collectionId]
            );

            if (ins.rowCount === 0) {
              acks.push({ eventId: ev.eventId, status: "ACKED", reason: "duplicate" });
              continue;
            }

            await client.query(
              `INSERT INTO changes (collection_id, entity_type, entity_id, op, payload)
               VALUES ($1::uuid, $2, $3::uuid, $4, $5::jsonb)`,
              [ev.collectionId, ev.entityType, ev.entityId, ev.op, ev.payload ?? null]
            );

            acks.push({ eventId: ev.eventId, status: "ACKED" });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            acks.push({
              eventId: ev.eventId,
              status: "FAILED",
              reason: msg.slice(0, 500),
            });
          }
        }

        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }

      const maxRow = await ctx.pool.query<{ m: string }>(
        "SELECT COALESCE(MAX(cursor), 0)::text AS m FROM changes"
      );
      const serverCursor = maxRow.rows[0]?.m ?? "0";

      return { serverCursor, acks };
    },
  },

  Subscription: {
    ping: {
      subscribe: async function* () {
        while (true) {
          await new Promise((r) => setTimeout(r, 2000));
          yield { ping: "pong" };
        }
      },
    },
  },
};
