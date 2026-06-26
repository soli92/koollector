import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";

import { getPool } from "./db.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { authMiddleware, actorFromWsParams } from "./auth/middleware.js";
import { buildAuthRouter } from "./routes/auth.js";

async function start() {
  const pool = getPool();

  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx) => ({
        pool,
        actorUserId: actorFromWsParams(ctx.connectionParams),
      }),
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use(authMiddleware);

  app.use("/auth", buildAuthRouter(pool));

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({
        pool,
        actorUserId: req.actorUserId ?? null,
      }),
    })
  );

  httpServer.listen(4000, () => {
    console.log("🚀 Koollector API → http://localhost:4000/graphql");
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
