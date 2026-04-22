---

# AI Log — Koollector

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Monorepo / workspace per raccolta **Koollector**: codice **mobile** (SQLite locale) e sync verso **API + Postgres** (commit `ad910bf`), Docker e documentazione. History compatta (9 commit).

**Stack AI usato (inferito; aggiornato 2026-04-22)**: **Cursor** — commit `7d59e6c` aggiunge `AGENTS.md` e `.cursor/rules/agents-context.mdc`. Nessun SDK LLM nel prodotto. History corta (9 commit) → evidenza limitata oltre questi artefatti.

**Periodo di sviluppo**: 2026-02-11 (`4bfc953` Initial commit) → 2026-03-26 (`7d59e6c`).

**Numero di commit**: 9

---

## Fasi di sviluppo (inferite dal history)

### Fase 1 — Bootstrap e import codice mobile

**Timeframe**: `4bfc953` → `43bb5a1` (First commit / added apps mobile).

**Cosa è stato fatto**: initial commit, dipendenze, import codice mobile nel repo.

**Evidenza di AI-assist** (inferita):

- Limitata: commit `956e64c ..` indica messaggio placeholder/minimale (tipico di WIP umano o squash).

**Decisioni architetturali notevoli**:

- Struttura **workspace** implicita (mobile + backend nel tempo).

**Prompt chiave usati**

> **Prompt [inferito]**: Nessun prompt specifico desumibile dai file del repo. La fase appare come **bootstrap standard** di monorepo/import codice mobile (`43bb5a1`, `b3defff`).

**Lezioni apprese**

> Nessuna lezione tecnica specifica desumibile oltre l’uso di commit placeholder (`956e64c ..`) — conviene evitare messaggi vuoti in `main`.

### Fase 2 — Sync Postgres, Docker, documentazione e contesto agenti

**Timeframe**: `ad910bf` → `7d59e6c`.

**Cosa è stato fatto**: wire API sync, fix SQLite mobile, Docker, README tabella script; tooling Node 22; **AGENTS.md** + regola Cursor.

**Evidenza di AI-assist** (inferita):

- `7d59e6c` menziona esplicitamente **Cursor** e `agents-context`.
- `199e564 docs: README — tabella script npm workspace` ha stile documentazione “handbook”.

**Decisioni architetturali notevoli**:

- **Postgres** come store server-side accanto a SQLite su device (`ad910bf`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Collega l’API sync a Postgres, correggi SQLite su mobile, aggiungi Docker e README tabella script npm; aggiungi AGENTS e regola Cursor."
> *Evidenza*: `ad910bf`, `199e564`, `7d59e6c`.

**Lezioni apprese**

- **Dual storage** SQLite + Postgres richiede attenzione a conflitti e migrazioni schema lato mobile (`ad910bf` messaggio).

### Altre attività

Non sono emerse ulteriori macro-fasi distinte: il repo ha pochi commit e alta densità semantica negli ultimi tre.

---

## Pattern ricorrenti identificati

- Allineamento con **ecosistema soli92**: Node 22, AGENTS, `.cursor/rules`.
- **Documentazione README** come superficie principale per onboarding.
- Commit `chore:` per tooling e upgrade dipendenze (`b43bff1`).

---

## Tecnologie e scelte di stack

- **Framework**: mobile app code + backend/API (dettaglio stack: vedi `package.json` / workspace — non riletto integralmente in questa passata)
- **Styling / UI**: non dedotto dalla sola history
- **State**: SQLite locale + sync server (`ad910bf`)
- **Deploy**: Docker menzionato in commit
- **LLM integration**: nessuna nel prodotto

## Problemi tecnici risolti (inferiti)

1. **Dipendenze / mobile SQLite**: `2a479c4 fixing dependencies` (messaggio vago; dettaglio tecnico da ricostruire dal diff se serve).

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

- `7d59e6c` chore: add AGENTS.md, README link, Cursor agents-context rule
- `b43bff1` chore: Node 22 tooling, dependency upgrades, and documentation
- `ad910bf` feat: wire API sync to Postgres, fix mobile SQLite, add Docker and docs
- `43bb5a1` chore: added apps mobile code to repo
- `4bfc953` Initial commit

---

## Punti aperti / note per il futuro

- **grep `TODO|FIXME|HACK|XXX`** in `apps/` (workspace): nessun match evidenziato in questa passata.
- **CI**: non emerge pipeline GitHub Actions nei commit elencati in appendice — valutare se manca o è in altro branch.
- **Debito tecnico inferito**: pochi commit totali → mancanza probabile di test automatici documentati nel log.
- **Debito tecnico inferito**: sync API/GraphQL (citato in `AGENTS.md` regole) richiede contract test tra mobile e server non visibili qui.

---

> **Nota metodologica**: completamento inferenze 2026-04-22; roadmap prodotto resta fuori repo.

---

## Metodologia compilazione automatica

Completamento autonomo il **22 aprile 2026** analizzando:

- **9** commit
- **~5** file (`README.md`, `AGENTS.md`, `docker-compose.yml`, `package.json` workspace, `.cursor/rules`)
- **0** occorrenze TODO/FIXME rilevanti (grep workspace limitato)

**Punti di minore confidenza:**

- Struttura esatta `apps/api` vs `apps/mobile` non ispezionata file-per-file in questa passata.
- Prompt fase 1 quasi assenti per mancanza di artefatti.

---
