---

# AI Log — Koollector

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Monorepo / workspace per raccolta **Koollector**: codice **mobile** (SQLite locale) e sync verso **API + Postgres** (commit `ad910bf`), Docker e documentazione. History compatta (9 commit).

**Stack AI usato (inferito)**: **Cursor** — evidenza diretta nel commit `7d59e6c chore: add AGENTS.md, README link, Cursor agents-context rule`.

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

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

### Fase 2 — Sync Postgres, Docker, documentazione e contesto agenti

**Timeframe**: `ad910bf` → `7d59e6c`.

**Cosa è stato fatto**: wire API sync, fix SQLite mobile, Docker, README tabella script; tooling Node 22; **AGENTS.md** + regola Cursor.

**Evidenza di AI-assist** (inferita):

- `7d59e6c` menziona esplicitamente **Cursor** e `agents-context`.
- `199e564 docs: README — tabella script npm workspace` ha stile documentazione “handbook”.

**Decisioni architetturali notevoli**:

- **Postgres** come store server-side accanto a SQLite su device (`ad910bf`).

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

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

> [TODO da compilare manualmente: roadmap prodotto, stato release mobile, CI]

---

> **Nota metodologica**: questo file è stato generato retroattivamente analizzando la history del repo. Le sezioni con `> [TODO da compilare manualmente]` richiedono la memoria del developer e non possono essere inferite dalla sola analisi automatica. Integra progressivamente con annotazioni manuali mentre lavori alle prossime fasi del progetto.

---
