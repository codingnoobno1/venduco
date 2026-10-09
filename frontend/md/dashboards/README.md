# 📊 VendorConnect Dashboards

*Role-based dashboard documentation for VendorConnect platform*

---

## 🎭 Roles Overview

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | Platform owner, full control | Highest |
| **Project Manager** | Oversees project execution | High |
| **Supervisor** | Field-level manager | Medium |
| **Vendor/Supplier** | Provides machines/materials | Medium |
| **Company Rep** | Corporate contractor oversight | Medium |
| **Guest/Read-only** | Audit & monitoring | Lowest |

---

## 📁 Dashboard Documentation

| Dashboard | File | Status |
|-----------|------|--------|
| Super Admin | [super-admin.md](./super-admin.md) | 📄 |
| Project Manager | [project-manager.md](./project-manager.md) | 📄 |
| Supervisor | [supervisor.md](./supervisor.md) | 📄 |
| Vendor | [vendor.md](./vendor.md) | 📄 |
| Company Representative | [company-rep.md](./company-rep.md) | 📄 |
| Guest/Read-only | [guest.md](./guest.md) | 📄 |

---

## 🔐 RBAC Hierarchy

```
Super Admin (Level 0)
    └── Project Manager (Level 1)
            ├── Supervisor (Level 2)
            └── Vendor (Level 2)
                    └── Company Rep (Level 2)
                            └── Guest (Level 3)
```

---

## 🎯 Feature Permissions Matrix

| Feature | Admin | PM | Supervisor | Vendor | Company Rep |
|---------|:-----:|:--:|:----------:|:------:|:-----------:|
| Create Project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Team | ✅ | ✅ | ❌ | ❌ | ✅* |
| Submit Report | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve Report | ✅ | ✅ | ❌ | ❌ | ❌ |
| Machine Assignment | ✅ | ✅ | ❌ | ❌ | ❌ |
| Budget Tracking | ✅ | ✅ | ❌ | ❌ | 👁️ |
| Location Updates | ✅ | ✅ | ✅ | ✅ | 👁️ |
| AI Reports | ✅ | ✅ | 👁️ | ❌ | 👁️ |
| Geo-Fencing Alerts | ✅ | ✅ | ✅ | ✅ | 👁️ |
| Export Reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ |

*✅ = Full access | 👁️ = View only | ❌ = No access | ✅* = Own staff only*

---

## 📱 Platform Targets

- **Web (Next.js)** - Full dashboard functionality
- **Mobile (MAUI)** - Field-optimized views
- **PWA** - Offline-capable features

---

*Last Updated: December 2024*
