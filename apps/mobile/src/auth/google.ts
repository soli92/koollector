import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { saveJwt } from "./storage";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

const discovery = AuthSession.useAutoDiscovery("https://accounts.google.com");

export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "koollector" });

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      redirectUri,
    },
    discovery
  );

  async function signIn(): Promise<void> {
    if (!request) return;
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") return;

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          code: result.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier ?? "" },
        },
        { tokenEndpoint: "https://oauth2.googleapis.com/token" }
      );

      const idToken = tokenResponse.idToken;
      if (!idToken) throw new Error("No idToken in Google response");

      const response = await fetch(`${API_URL}/auth/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", idToken }),
      });

      const data = await response.json() as { jwt?: string; error?: string };
      if (!response.ok || !data.jwt) throw new Error(data.error ?? "Auth exchange failed");

      await saveJwt(data.jwt);
    } finally {
      setIsLoading(false);
    }
  }

  return { signIn, isLoading };
}
