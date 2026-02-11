import { apolloClient } from "../graphql/client";
import { PUSH_EVENTS, PULL_CHANGES } from "../graphql/sync.gql";
import { dbPromise } from "../db/db";

// helper: leggi/scrivi cursor
async function getCursor(): Promise<string> {
    const db = await dbPromise;
    const rows = await db.getAllAsync<{ value: string }>(
        "SELECT value FROM cursor_store WHERE key = ?",
        ["serverCursor"]
    );
    return rows[0]?.value ?? "0";
}

async function setCursor(value: string) {
    const db = await dbPromise;
    await db.runAsync(
        "INSERT INTO cursor_store(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        ["serverCursor", value]
    );
}

// helper: prendi batch outbox pending
async function getPendingOutbox(limit = 100) {
    const db = await dbPromise;
    return db.getAllAsync<any>(
        "SELECT * FROM outbox WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT ?",
        [limit]
    );
}

async function markAcked(ids: string[]) {
    if (!ids.length) return;
    const db = await dbPromise;
    // semplice: aggiorna uno per uno (puoi ottimizzare dopo)
    for (const id of ids) {
        await db.runAsync("UPDATE outbox SET status='ACKED' WHERE id=?", [id]);
    }
}

// APPLY changes (LWW su updated_at)
async function applyChange(change: any) {
    const db = await dbPromise;

    // Esempio per entity_type "owned_cards" (adatta quando aggiungi le tabelle dominio)
    if (change.entityType === "owned_cards" && change.op === "UPSERT") {
        const payload = change.payload; // object
        // LWW: aggiorna solo se incoming.updatedAt >= local.updatedAt
        // Qui assumiamo una tabella owned_cards locale con campo updated_at.
        await db.runAsync(
            `
      INSERT INTO owned_cards(id, card_id, owner_user_id, quantity, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        card_id=excluded.card_id,
        owner_user_id=excluded.owner_user_id,
        quantity=excluded.quantity,
        updated_at=excluded.updated_at
      WHERE owned_cards.updated_at < excluded.updated_at
      `,
            [payload.id, payload.cardId, payload.ownerUserId, payload.quantity, payload.updatedAt]
        );
    }

    if (change.entityType === "owned_cards" && change.op === "DELETE") {
        await db.runAsync("DELETE FROM owned_cards WHERE id = ?", [change.entityId]);
    }
}

export async function syncOnce(params: {
    deviceId: string;
    collectionIds: string[];
    actorUserId: string;
}) {
    // 1) PUSH
    const pending = await getPendingOutbox(200);

    if (pending.length) {
        const events = pending.map((row) => ({
            eventId: row.id,
            collectionId: row.collection_id,
            entityType: row.entity_type,
            entityId: row.entity_id,
            op: row.op,
            payload: row.payload_json ? JSON.parse(row.payload_json) : null,
            clientTs: row.updated_at,
            actorUserId: params.actorUserId,
        }));

        const pushRes = await apolloClient.mutate({
            mutation: PUSH_EVENTS,
            variables: { input: { deviceId: params.deviceId, events } },
        });

        const acks = pushRes.data?.pushEvents?.acks ?? [];
        const ackedIds = acks.filter((a: any) => a.status === "ACKED").map((a: any) => a.eventId);
        await markAcked(ackedIds);
    }

    // 2) PULL
    const since = await getCursor();
    const pullRes = await apolloClient.query({
        query: PULL_CHANGES,
        variables: { input: { deviceId: params.deviceId, sinceCursor: since, collectionIds: params.collectionIds } },
        fetchPolicy: "network-only",
    });

    const payload = pullRes.data?.pullChanges;
    const changes = payload?.changes ?? [];

    // 3) APPLY
    for (const ch of changes) {
        await applyChange(ch);
    }

    // 4) UPDATE CURSOR
    if (payload?.nextCursor) {
        await setCursor(payload.nextCursor);
    }

    return { pushed: pending.length, pulled: changes.length, cursor: payload?.nextCursor ?? since };
}

export async function enqueueOutbox(op: {
    id: string;
    entityType: string;
    entityId: string;
    collectionId: string;
    operation: "UPSERT" | "DELETE";
    payload?: any;
    updatedAt: string;
}) {
    const db = await dbPromise;
    await db.runAsync(
        `INSERT INTO outbox(id, entity_type, entity_id, collection_id, op, payload_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            op.id,
            op.entityType,
            op.entityId,
            op.collectionId,
            op.operation,
            op.payload ? JSON.stringify(op.payload) : null,
            op.updatedAt,
        ]
    );
}
