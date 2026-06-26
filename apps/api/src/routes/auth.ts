import { Router } from "express";
import type { Pool } from "pg";
import { verifyGoogleToken, verifyAppleToken } from "../auth/providers.js";
import { signToken } from "../auth/jwt.js";

export function buildAuthRouter(pool: Pool): Router {
  const router = Router();

  router.post("/exchange", async (req, res) => {
    const { provider, idToken } = req.body as { provider?: string; idToken?: string };

    if (!provider || !idToken) {
      res.status(400).json({ error: "provider and idToken are required" });
      return;
    }

    try {
      let profile: { providerId: string; email: string; displayName: string };

      if (provider === "google") {
        profile = await verifyGoogleToken(idToken);
      } else if (provider === "apple") {
        profile = await verifyAppleToken(idToken);
      } else {
        res.status(400).json({ error: `Unsupported provider: ${provider}` });
        return;
      }

      const result = await pool.query<{ id: string }>(
        `INSERT INTO users (id, display_name, email, provider, provider_id)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         ON CONFLICT (provider, provider_id) DO UPDATE
           SET display_name = EXCLUDED.display_name,
               email        = EXCLUDED.email
         RETURNING id`,
        [profile.displayName, profile.email, provider, profile.providerId]
      );

      const userId = result.rows[0].id;
      const token = signToken(userId);

      res.json({ jwt: token, userId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      res.status(401).json({ error: message });
    }
  });

  return router;
}
