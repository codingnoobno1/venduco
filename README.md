# VendorConnect

Base project laid out as the architecture specification describes (`docs/VendorConnect_NextJS_Kotlin_Secure_Architecture(2).md`, sections 5 and 7).

- `backend/` — Kotlin, one Gradle module per layer. Dependencies point inwards only:
  bootstrap -> adapters (web, security, persistence, storage, jobs) -> application -> domain.
- `frontend/` — Next.js presentation layer. Blank.
- `contracts/`, `deployment/`, `docs/`, `.github/workflows/` — blank.
- `backend/_recovered/` — Kotlin files recovered from the lost project, sorted by the module each belongs to.
  They are reference material and are **not compiled**: they use the old `com.vendorconnect.core` packages and
  many of the types they need were not recovered.

## Check that the layers are connected

    cd backend
    .\gradlew.bat :bootstrap:bootRun

then open http://localhost:8080/api/v1/connectivity. The request goes web adapter -> application use case ->
persistence port -> SQLite adapter, and the answer names every layer it passed through.
