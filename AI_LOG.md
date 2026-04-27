---

# AI Log — Koollector

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Monorepo **GraphQL (Apollo) + Express + Postgres** (`apps/api`, porta 4000) e **Expo** mobile con SQLite/Apollo. Node **22+** (`npm` workspaces). Contesto in **`AGENTS.md`**.

**Aggiornamento 2026-04-27** — Soli Prof (RAG) / documentazione: questo repository è in **[soli-prof `CORPUS_REPOS`](https://github.com/soli92/soli-prof/blob/main/lib/rag-service/config.ts)**. Un webhook **`push`** verso `https://soli-prof.vercel.app/api/webhooks/github` può attivare re-ingest (HMAC, segreto lato Soli Prof / GitHub). I test in workspace `apps/api` e mobile **non** dipendono da quel flusso. Riferimenti: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `setup-webhooks.sh` nel repo Soli Prof.

---
