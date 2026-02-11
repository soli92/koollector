import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

const typeDefs = `#graphql
  type Query {
    health: String!
  }

  type Subscription {
    ping: String!
  }
`;

const resolvers = {
    Query: {
        health: () => "ok"
    },
    Subscription: {
        ping: {
            subscribe: async function* () {
                while (true) {
                    await new Promise(r => setTimeout(r, 2000));
                    yield { ping: "pong" };
                }
            }
        }
    }
};

async function start() {
    const app = express();
    const httpServer = createServer(app);

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/graphql"
    });

    const serverCleanup = useServer({ schema }, wsServer);

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        }
                    };
                }
            }
        ]
    });

    await server.start();

    app.use(
        "/graphql",
        cors(),
        express.json(),
        expressMiddleware(server)
    );

    httpServer.listen(4000, () => {
        console.log("🚀 Koollector API → http://localhost:4000/graphql");
    });
}

start();