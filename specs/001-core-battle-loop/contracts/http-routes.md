# Contract: Application Route Handlers

The browser-facing surface for the six MVP pages. Single-owner/no-auth
for v1 (spec Assumptions) — no per-request identity check yet, but
every write still validates server-side per Principle II ("All data
crossing a trust boundary... MUST be validated before use").

| Route | Method | Purpose | Notes |
|---|---|---|---|
| `/api/builds` | GET | List the player's saved Tank Builds | |
| `/api/builds` | POST | Save a new Tank Build | Validates tier unlocks (FR-002) and weight capacity (FR-003) server-side |
| `/api/builds/:id` | PATCH | Update a saved build | Same validation as create |
| `/api/programs` | GET | List the player's saved Pilot Code Programs | |
| `/api/programs` | POST | Save a new program | Validates JS syntax before persisting (spec Edge Cases: invalid syntax must not lose the player's unsaved text on the client) |
| `/api/programs/:id` | PATCH | Update a saved program | |
| `/api/opponents` | GET | List bosses + practice challengers available at the player's current rank | Backs the Battles browser page |
| `/api/battles` | POST | Submit a battle: `{ buildId, programId, opponentId }` | Snapshots build+program at submission time (data-model.md); returns `{ battleId, status: "queued" }`; queues for server-side simulation (FR-017), does not simulate inline |
| `/api/battles` | GET | List the player's battle history | Backs Battles page's history tab |
| `/api/battles/:id` | GET | Poll a battle's status/outcome | `queued` \| `simulating` \| `complete` + `outcome` once complete |
| `/api/battles/:id/log` | GET | Fetch the full tick log for replay | Only available once `status = complete`; this is what the Replay Viewer reads |

## Non-negotiables

- Submitting a battle MUST re-validate the build against the player's
  *current* rank server-side, not trust whatever the client last
  rendered (a rank could have changed since the build was loaded).
- `/api/battles` (POST) MUST NOT simulate synchronously in the request/
  response cycle — it enqueues and returns immediately, per FR-017's
  queued execution model and this feature's non-real-time performance
  goal.
