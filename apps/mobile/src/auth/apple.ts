import * as AppleAuthentication from "expo-apple-authentication";
import { saveJwt } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export async function isAppleAuthAvailable(): Promise<boolean> {
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<void> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const idToken = credential.identityToken;
  if (!idToken) throw new Error("No identityToken in Apple credential");

  const response = await fetch(`${API_URL}/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "apple", idToken }),
  });

  const data = await response.json() as { jwt?: string; error?: string };
  if (!response.ok || !data.jwt) throw new Error(data.error ?? "Auth exchange failed");

  await saveJwt(data.jwt);
}
