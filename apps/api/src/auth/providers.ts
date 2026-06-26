import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";

export type ProviderProfile = {
  providerId: string;
  email: string;
  displayName: string;
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string): Promise<ProviderProfile> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) throw new Error("Invalid Google token payload");
  return {
    providerId: payload.sub,
    email: payload.email ?? "",
    displayName: payload.name ?? payload.email ?? "User",
  };
}

export async function verifyAppleToken(idToken: string): Promise<ProviderProfile> {
  const payload = await appleSignin.verifyIdToken(idToken, {
    audience: process.env.APPLE_BUNDLE_ID ?? "com.koollector.app",
    ignoreExpiration: false,
  });
  if (!payload.sub) throw new Error("Invalid Apple token payload");
  return {
    providerId: payload.sub,
    email: payload.email ?? "",
    displayName: payload.email ?? "User",
  };
}
