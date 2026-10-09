// Loads development demo data into the VendorConnect SQLite database.
//
// REWRITTEN on 2026-10-07: the original scripts/seed/seed.js was not available. The organisations, project managers,
// projects, sections and packages below are the rows of the original seed as recovered from session logs (same ids);
// the vendor company, its user, the tenders and the machines are new, because those rows were not recovered.
//
// Usage:  node seed.js <path to vendorconnect.db>
// The database must already have its schema: start the backend once so Flyway creates it. Restart the backend
// afterwards so every seeded user is given the role assignment that matches their role.
// Sign-in details are read from docs/SEED_USERS.md, which is the single place they are written down.
// Development only. Never run this against a production database.

const { DatabaseSync } = require('node:sqlite')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const bcrypt = require('bcryptjs')

const dbPath = process.argv[2]
if (!dbPath || !fs.existsSync(dbPath)) {
  console.error('Usage: node seed.js <path to an existing vendorconnect.db>')
  process.exit(1)
}

/** Stable id for a name, so running the seed again updates rows instead of adding them. */
function idOf(name) {
  const h = crypto.createHash('sha1').update('vendorconnect:seed:' + name).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`
}

const NOW = '2026-10-01T09:00:00.000Z'
const rupees = (crore) => Math.round(crore * 1e7) * 100   // crore rupees -> paise

// ── Organisations ──
const ORG = {
  dfccil: '2be17a3c-89d2-52a3-8881-6ae833b6398f',
  rvnl: '7499b2c1-a975-5b44-8739-c5a4d333c4e0',
  lnt: '3bcf0611-9680-5ee3-91ef-4f100114f4ed',
  tata: 'fffcc5ba-60ea-50c5-a1cd-91f02b250f5c',
  vendor: idOf('org:ganesh-infra'),
}
const organizations = [
  [ORG.dfccil, 'DFCCIL', 'DFCCIL', 'GOVERNMENT_AUTHORITY'],
  [ORG.rvnl, 'RVNL', 'RVNL', 'GOVERNMENT_AUTHORITY'],
  [ORG.lnt, 'Larsen & Toubro', 'LNT', 'EPC_CONTRACTOR'],
  [ORG.tata, 'Tata Projects', 'TATA', 'EPC_CONTRACTOR'],
  [ORG.vendor, 'Ganesh Infra Supplies', 'GANESH', 'VENDOR'],
]

// ── Users: role, name, email and password come from the table in docs/SEED_USERS.md ──
const ORG_BY_NAME = { 'DFCCIL': ORG.dfccil, 'RVNL': ORG.rvnl, 'Larsen & Toubro': ORG.lnt, 'Tata Projects': ORG.tata, 'Ganesh Infra Supplies': ORG.vendor }
const USER_IDS = {
  'pm.rahul@vendorconnect.test': '46e1ece2-f461-5db9-a902-1a52fec2f886',
  'pm.anita@vendorconnect.test': '41bf3a13-45a8-5e1a-92ff-428aa4470abe',
}
const doc = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'SEED_USERS.md'), 'utf8')
const users = []
for (const line of doc.split(/\r?\n/)) {
  const cells = line.split('|').map((c) => c.trim())
  const role = /^`([A-Z_]+)`/.exec(cells[1] || '')
  const email = /^`([^`]+@[^`]+)`$/.exec(cells[3] || '')
  const password = /^`([^`]+)`$/.exec(cells[4] || '')
  if (!role || !email || !password) continue
  users.push({
    id: USER_IDS[email[1]] || idOf('user:' + email[1]),
    role: role[1], name: cells[2], email: email[1], password: password[1],
    organizationId: ORG_BY_NAME[cells[5]] || null,
  })
}
if (users.length === 0) {
  console.error('No users found in docs/SEED_USERS.md')
  process.exit(1)
}

// ── Projects, sections, packages (recovered rows) ──
const P = {
  edfc: '77428ab9-3007-5b3f-8515-9a9844b5166a',
  wdfc: '9c3a0202-bbc4-5bb9-bcb1-5f602bed0c85',
  depot: '0662d249-2ba3-5973-a82b-58d0da29c20a',
  metro: 'a9dab608-828d-552b-b190-8dc3ce0fdc33',
}
const RAHUL = USER_IDS['pm.rahul@vendorconnect.test']
const ANITA = USER_IDS['pm.anita@vendorconnect.test']
// The original image files (/images/railway.jpg, /images/metro.jpg) were lost; these exist in the frontend.
const RAIL_IMAGE = '/images/login/civil-delivery.png'
const METRO_IMAGE = '/images/login/integrated-corridor.png'
const projects = [
  [P.edfc, 'Eastern DFC – Sonnagar to Dankuni', 'Eastern Dedicated Freight Corridor', ORG.dfccil, RAHUL, 'IN_PROGRESS', 6400000000000, RAIL_IMAGE],
  [P.wdfc, 'Western DFC – JNPT to Vadodara', 'Western Dedicated Freight Corridor', ORG.dfccil, ANITA, 'IN_PROGRESS', 5100000000000, RAIL_IMAGE],
  [P.depot, 'Vande Bharat Maintenance Depot – Phase 1', 'Mumbai–Ahmedabad Rail Corridor', ORG.rvnl, ANITA, 'PLANNING', 780000000000, METRO_IMAGE],
  [P.metro, 'Kolkata Metro Line 6 Extension', 'Kavi Subhash–Biman Bandar Corridor', ORG.rvnl, ANITA, 'PLANNING', 1250000000000, METRO_IMAGE],
]
const S = {
  sonnagar: 'f57ec7b9-fd99-5aa8-829e-51ae3c4421d0',
  mughalsarai: '79d80d2d-2968-5331-ba2c-1610f93952b7',
  jnpt: '76baa173-b595-575f-b9a0-f7d2669ee50b',
  vasai: '6060555f-9711-55d1-9af5-c5f9ac60b394',
  sabarmati: '07e2be70-33b4-5577-82a0-56c555c625fc',
}
const sections = [
  [S.sonnagar, P.edfc, 'Sonnagar – Mughalsarai', 24.9525, 84.0189, 'Sonnagar', 25.2823, 83.119, 'Pt. DD Upadhyaya Jn', 137.5],
  [S.mughalsarai, P.edfc, 'Mughalsarai – Prayagraj', 25.2823, 83.119, 'Pt. DD Upadhyaya Jn', 25.4358, 81.8463, 'Prayagraj', 142],
  [S.jnpt, P.wdfc, 'JNPT – Vasai Road', 18.95, 72.95, 'JNPT', 19.3919, 72.8397, 'Vasai Road', 98],
  [S.vasai, P.wdfc, 'Vasai Road – Vadodara', 19.3919, 72.8397, 'Vasai Road', 22.3072, 73.1812, 'Vadodara', 310],
  [S.sabarmati, P.depot, 'Sabarmati Depot Site', 23.085, 72.587, 'Sabarmati Yard North', 23.079, 72.599, 'Sabarmati Yard South', 4.2],
]
const PKG = { edfc102: '56bc93ac-f5f3-5eeb-a808-6c6da59ab71b', wdfc101: '85dde040-d028-5688-8025-fa330ab73359', vbd101: 'd297ae23-e3c3-505d-abf1-a03a53f1b08f' }
const packages = [
  ['70ff76ff-dc2e-5038-a3fe-22e5bca702fe', S.sonnagar, 'EDFC-101', 'Earthwork, bridges & track – Sonnagar to Dehri', ORG.lnt, 'COMPLETED', 1180000000000],
  [PKG.edfc102, S.sonnagar, 'EDFC-102', 'Earthwork, bridges & track – Dehri to Mughalsarai', ORG.lnt, 'IN_PROGRESS', 1320000000000],
  ['6957fce0-310a-5ada-8924-8e3cb4960b98', S.mughalsarai, 'EDFC-201', 'Track linking & signalling – Mughalsarai to Prayagraj', ORG.tata, 'DELAYED', 1540000000000],
  [PKG.wdfc101, S.jnpt, 'WDFC-101', 'Viaduct & ROB construction – JNPT to Vasai', ORG.tata, 'IN_PROGRESS', 960000000000],
  ['d5859bdc-4bc8-5b9f-9bcf-95d30168aa07', S.vasai, 'WDFC-201', 'Formation & minor bridges – Vasai to Surat', ORG.lnt, 'MOBILIZATION', 1410000000000],
  ['4d938492-5453-575b-b3e4-ac6f2ff935fb', S.vasai, 'WDFC-202', 'Formation & minor bridges – Surat to Vadodara', null, 'NOT_STARTED', 1250000000000],
  [PKG.vbd101, S.sabarmati, 'VBD-101', 'Inspection bays, pit lines & shed structure', ORG.tata, 'NOT_STARTED', 310000000000],
]

// ── Tenders and their items (new rows) ──
const tenders = [
  { key: 'ballast', title: 'Supply of track ballast – EDFC-102', description: 'Machine-crushed stone ballast, 65 mm nominal size, delivered to Dehri and Sasaram stacking yards.',
    ref: 'TND-2026-EDFC-001', project: P.edfc, pkg: PKG.edfc102, value: rupees(42), status: 'PUBLISHED', publish: '2026-09-20', closing: '2026-11-15',
    items: [['Stone ballast 65 mm', 180000, 'cum', 185000], ['Loading and transport to yard', 180000, 'cum', 48000]] },
  { key: 'girders', title: 'Steel girders for viaduct spans – WDFC-101', description: 'Fabrication and supply of open web steel girders for 12 viaduct spans between JNPT and Vasai.',
    ref: 'TND-2026-WDFC-001', project: P.wdfc, pkg: PKG.wdfc101, value: rupees(96), status: 'PUBLISHED', publish: '2026-09-28', closing: '2026-11-30',
    items: [['Open web girder 45.7 m span', 12, 'nos', 650000000], ['Bearings and holding-down bolts', 48, 'sets', 18500000], ['Transport and unloading at site', 12, 'trips', 22000000]] },
  { key: 'depot-plant', title: 'Depot plant and pit-line equipment – VBD-101', description: 'Synchronised lifting jacks, bogie turntables and underfloor wheel lathe for the maintenance shed.',
    ref: 'TND-2026-VBD-001', project: P.depot, pkg: PKG.vbd101, value: rupees(58), status: 'DRAFT', publish: null, closing: '2026-12-20',
    items: [['Synchronised lifting jacks, set of 16', 2, 'sets', 950000000], ['Underfloor wheel lathe', 1, 'nos', 2400000000]] },
]

// ── Machines of the vendor company (new rows) ──
const machines = [
  ['EX-210', 'Tata Hitachi EX 210', 'EXCAVATOR', 'Tata Hitachi', 'EX 210LC', 2021, '21 t', 'Dehri yard', 'BR24GA4471', '2027-03-31', '2026-08-18', 'AVAILABLE'],
  ['TP-2518', 'Tipper 2518', 'TIPPER', 'Tata Motors', 'LPK 2518', 2022, '16 cum', 'Sasaram stacking yard', 'BR24GB1120', '2027-01-15', '2026-09-02', 'ASSIGNED'],
  ['CR-55', 'Crawler crane 55 t', 'CRANE', 'Kobelco', 'CKE550', 2019, '55 t', 'Vasai casting yard', null, '2026-12-10', '2026-07-25', 'MAINTENANCE'],
]

const db = new DatabaseSync(dbPath)
db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 10000;')

function upsert(table, key, row) {
  const columns = Object.keys(row)
  const updates = columns.filter((c) => c !== key && c !== 'created_at').map((c) => `${c} = excluded.${c}`).join(', ')
  db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})
              ON CONFLICT(${key}) DO UPDATE SET ${updates}`).run(...columns.map((c) => row[c]))
}

db.exec('BEGIN IMMEDIATE')
try {
  for (const [id, name, code, type] of organizations) {
    upsert('organizations', 'id', { id, name, code, type, is_active: 1, created_at: NOW, updated_at: NOW })
  }
  for (const u of users) {
    // BCrypt cost 12, the same as the backend's password encoder.
    upsert('users', 'id', { id: u.id, email: u.email, full_name: u.name, password_hash: bcrypt.hashSync(u.password, 12), role: u.role,
      organization_id: u.organizationId, is_active: 1, created_at: NOW, updated_at: NOW })
  }
  for (const [id, name, corridor, org, head, status, budget, image] of projects) {
    upsert('projects', 'id', { id, name, corridor_name: corridor, organization_id: org, project_head_id: head, status,
      estimated_budget_minor: budget, estimated_budget_currency: 'INR', image_url: image, created_at: NOW, updated_at: NOW })
  }
  for (const [id, project, name, slat, slon, slabel, elat, elon, elabel, km] of sections) {
    upsert('project_sections', 'id', { id, project_id: project, name, start_latitude: slat, start_longitude: slon, start_label: slabel,
      end_latitude: elat, end_longitude: elon, end_label: elabel, length_km: km })
  }
  for (const [id, section, number, description, contractor, status, value] of packages) {
    upsert('corridor_packages', 'id', { id, section_id: section, package_number: number, description, contractor_id: contractor, status,
      estimated_value_minor: value, estimated_value_currency: 'INR' })
  }
  for (const t of tenders) {
    const tenderId = idOf('tender:' + t.key)
    upsert('tenders', 'id', { id: tenderId, title: t.title, description: t.description, reference_number: t.ref, project_id: t.project,
      package_id: t.pkg, estimated_value_minor: t.value, estimated_value_currency: 'INR', status: t.status, publish_date: t.publish,
      closing_date: t.closing, created_at: NOW, updated_at: NOW })
    t.items.forEach(([description, quantity, unit, rate], index) => {
      upsert('tender_items', 'id', { id: idOf(`tender-item:${t.key}:${index}`), tender_id: tenderId, description, quantity, unit,
        estimated_rate_minor: rate, estimated_rate_currency: 'INR' })
    })
  }
  for (const [code, name, type, maker, model, year, capacity, location, registration, insurance, maintenance, status] of machines) {
    upsert('machines', 'id', { id: idOf('machine:' + code), owner_type: 'ORGANIZATION', owner_id: ORG.vendor, machine_code: code, name,
      machine_type: type, manufacturer: maker, model, year_of_manufacture: year, capacity, location, registration_number: registration,
      insurance_expiry: insurance, last_maintenance_date: maintenance, status, created_at: NOW, updated_at: NOW })
  }
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  throw error
}

for (const table of ['organizations', 'users', 'projects', 'project_sections', 'corridor_packages', 'tenders', 'tender_items', 'machines']) {
  console.log(table.padEnd(18), db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n)
}
console.log('Seeded users:', users.map((u) => `${u.role} ${u.email}`).join(', '))
db.close()
