import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { SetContextLink } from "@apollo/client/link/context";
import { Platform } from "react-native";
import { loadJwt } from "../auth/storage";

const DEV_HOST =
    Platform.OS === "android"
        ? "10.0.2.2"
        : "localhost";

// When testing on a physical device set EXPO_PUBLIC_API_HOST to your Mac's LAN IP.
const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? DEV_HOST;

const HTTP_URI = `http://${API_HOST}:4000/graphql`;
const WS_URI   = `ws://${API_HOST}:4000/graphql`;

const httpLink = new HttpLink({ uri: HTTP_URI });

const authLink = new SetContextLink(async (prev) => {
    const token = await loadJwt();
    return {
        headers: {
            ...prev.headers,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
    };
});

const wsLink = new GraphQLWsLink(
    createClient({
        url: WS_URI,
        connectionParams: async () => {
            const token = await loadJwt();
            return token ? { authorization: `Bearer ${token}` } : {};
        },
    })
);

const splitLink = split(
    ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === "OperationDefinition" && def.operation === "subscription";
    },
    wsLink,
    authLink.concat(httpLink)
);

export const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
});
