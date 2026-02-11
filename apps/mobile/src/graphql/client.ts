// apps/mobile/src/graphql/client.ts
import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { SetContextLink } from "@apollo/client/link/context";
import { Platform } from "react-native";

// 1) Base URL (DEV): cambia solo questo valore con l'IP del tuo Mac quando usi device fisico
// - iOS Simulator: spesso funziona localhost
// - Android Emulator: 10.0.2.2 (se ti servirà)
// - Device fisico: IP del Mac nella LAN (es. 192.168.1.10)
const DEV_HOST =
    Platform.OS === "android"
        ? "10.0.2.2"
        : "localhost";

// 👉 Se stai usando un iPhone reale, imposta DEV_HOST al tuo IP, tipo:
// const DEV_HOST = "192.168.1.10";

const HTTP_URI = `http://${DEV_HOST}:4000/graphql`;
const WS_URI = `ws://${DEV_HOST}:4000/graphql`;

// 2) HTTP link
const httpLink = new HttpLink({ uri: HTTP_URI });

// 3) Auth link (pronto per quando aggiungeremo JWT/device token)
// Apollo mostra SetContextLink come modo standard per aggiungere headers auth. [3](https://www.apollographql.com/docs/react/api/link/apollo-link-context)
const authLink = new SetContextLink((prev) => {
    // TODO: recupera token da SecureStore/Keychain quando lo aggiungeremo
    const token = null;
    return {
        headers: {
            ...prev.headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

// 4) WS link per subscriptions (graphql-ws)
// Apollo Client supporta graphql-ws e richiede stesso subprotocol server/client. [2](https://www.apollographql.com/docs/react/data/subscriptions)
const wsLink = new GraphQLWsLink(
    createClient({
        url: WS_URI,
        connectionParams: async () => {
            const token = null; // TODO
            return token ? { authorization: `Bearer ${token}` } : {};
        },
    })
);

// 5) Split: subscription -> ws, altrimenti -> http (con auth)
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