# What is left here

The backend sources now come from the recovery on E:/vendorconnect-platform, moved into the modules with new
packages. This folder only holds what was not carried over:

- `superseded/` - recovered files the original project had already replaced or deleted (`HealthController`,
  `DynamicRoutePermissionRegistryTest`);
- the first recovery's `VendorConnectApplication.kt`, `application*.yml` and build files, kept for reference.

One test is left out of compilation (`../recovered-pending.txt`): `ProjectStructureIntegrationTest`.

The backend as it stood before the E: sources were brought in is saved as
D:/vc/backup_recovery/f-backend-before-e-import.tgz.
