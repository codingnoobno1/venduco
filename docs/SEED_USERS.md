# VendorConnect — Seeded Dev Users & Demo Data

> [!CAUTION]
> **Development / demo credentials only.** These passwords are committed in plain text on purpose.
> Never seed a production database with this script, and never reuse these passwords anywhere real.

Seeded into the SQLite database `the path you pass to it` by [`scripts/seed/seed.js`](../scripts/seed/seed.js).
Passwords are stored as **BCrypt (cost 12)** hashes, identical to what Spring's `BCryptPasswordEncoder(12)` produces.

## Login credentials

Sign in at <http://localhost:3000/login>.

| Role | Name | Email | Password | Organization | Lands on |
|---|---|---|---|---|---|
| `ADMIN` | Aarav Admin | `admin@vendorconnect.test` | `Admin@VC2026!` | – | `/dashboard/admin` |
| `PROJECT_HEAD` (Project Manager) | Rahul Singh | `pm.rahul@vendorconnect.test` | `ProjectHead@VC2026!` | DFCCIL | `/dashboard/pm` |
| `PROJECT_HEAD` (Project Manager) | Anita Verma | `pm.anita@vendorconnect.test` | `ProjectHead@VC2026!` | RVNL | `/dashboard/pm` |
| `EPC_MANAGER` | Vikram Patel | `epc.vikram@vendorconnect.test` | `EpcManager@VC2026!` | Larsen & Toubro | `/dashboard/pm` |
| `EPC_MANAGER` | Suresh Nair | `epc.suresh@vendorconnect.test` | `EpcManager@VC2026!` | Tata Projects | `/dashboard/pm` |
| `SUPERVISOR` | Rajesh Kumar | `supervisor.rajesh@vendorconnect.test` | `Supervisor@VC2026!` | Larsen & Toubro | `/dashboard/supervisor` |
| `SUPERVISOR` | Priya Sharma | `supervisor.priya@vendorconnect.test` | `Supervisor@VC2026!` | Tata Projects | `/dashboard/supervisor` |
| `VENDOR` | Mahesh Ganesh | `vendor.mahesh@vendorconnect.test` | `Vendor@VC2026!` | Ganesh Infra Supplies | `/dashboard/vendor` |

> This copy of the document was recovered with a gap after the table above: the original listed more users and
> described the seeded organisations, projects and tenders. The vendor row was added again when the seed script
> was rewritten; `scripts/seed/seed.js` reads the sign-in details from this table.

3. **Corridor Packages:** Sections are further divided into *Packages* awarded to specific organizations (e.g., L&T). The EPC Manager oversees these packages.
4. **Tenders & Items:** To fulfill package requirements, *Tenders* are created. Tenders consist of *Tender Items* (BOQ - Bill of Quantities). Vendors submit bids against these tenders.
5. **Role Workflow:** 
   - A `PROJECT_HEAD` (e.g., Rahul Singh) creates a Project and defining its Sections.
   - An `EPC_MANAGER` (e.g., Vikram Patel at L&T) is assigned a Corridor Package and issues Tenders for materials.
   - A `VENDOR` (e.g., Mahesh Ganesh) bids on those Tenders.
   - A `SUPERVISOR` (e.g., Rajesh Kumar) reports on-the-ground progress and issues for the active packages.

Money is stored as integer **paise** (minor units), as required by migration `V3__integrity_fixes.sql`.
Row IDs are deterministic UUIDs, so the seed is idempotent: re-running it updates rows instead of duplicating them.

## Re-running the seed

```powershell
cd scripts/seed
npm install          # once (installs bcryptjs)
node seed.js <path to vendorconnect.db>
npm run generate     # only rewrite seed.sql (no database changes)
node seed.js D:\path\to\other.db   # target a different database file
```

- The database file must already exist: start the backend once so Flyway creates the schema.
- Requires Node.js ≥ 22.5 (uses the built-in `node:sqlite`).
- The generated SQL is [`scripts/seed/seed.sql`](../scripts/seed/seed.sql); it can also be applied with any SQLite client.
- [`scripts/seed/verify-logins.ps1`](../scripts/seed/verify-logins.ps1) logs in every user through the Next.js proxy and prints role, permission count and RBAC result.

