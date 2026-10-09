# Where each frontend file came from

This folder is the upgraded Next.js frontend put back together after the original was lost. Files recovered from
AI session logs are used where they exist; where they do not, the copy from the old project (D:/vc/venduco) stands in.
The old project itself was only read.

Files marked OUTDATED existed in the upgraded frontend in a changed form that was not recovered: what is here is the
old version, which mostly still calls the removed `/api/...` routes instead of the Kotlin backend at `/api/v1/...`.

| Origin | Files |
|---|---|
| old project, OUTDATED | 103 |
| old project, unchanged | 69 |
| recovered | 48 |
| recovered (first recovery) | 24 |
| MISSING | 4 |
| old project; newer version only partly recovered | 3 |
| old project, brought over because an outdated file still imports it | 13 |

Not brought over from the old project: its `src/app/api` routes, Mongoose models and server-side libraries (the
upgrade had removed them), `.env`, `package-lock.json` and generated files.

Changed by hand: `src/app/layout.tsx` (old version, React Native Paper provider removed) and `package.json`
(`@radix-ui/react-accordion` added for the old FAQ section).

## Ported to the Kotlin backend

The old pages kept a token in localStorage and called the removed `/api/...` routes. 48 of them were converted:
the token lookups and `Authorization` headers are gone, and their requests go through `legacyFetch` (`src/lib/legacy.ts`),
which uses the session cookies, maps `/api/<path>` to `/api/v1/<path>` and returns the `{ success, data }` shape those
pages read. The sign-in page uses `authApi.login`; the two settings pages read the user from `AuthContext`.
`legacy.ts` was written during this work; it is not original code.

Most of the endpoints these pages call do not exist in the Kotlin backend yet (tasks, reports, attendance, chat,
materials, rentals, inventory, issues, costs, notifications, vendor orders and billing): those pages load and show
their empty state.

## old project, OUTDATED (103)

- `.gitignore`
- `API_COMPLETE.md`
- `AUTHENTICATION_GUIDE.md`
- `COMPONENT_LIBRARY.md`
- `COMPONENT_TREE.txt`
- `DARK_MODE_FINAL.md`
- `DARK_MODE_IMPLEMENTATION.md`
- `DARK_MODE_RESTART_REQUIRED.md`
- `FINAL_IMPLEMENTATION_SUMMARY.md`
- `IMPLEMENTATION_SUMMARY.md`
- `MONGODB_SETUP.md`
- `PROFESSIONAL_UI_COMPLETE.md`
- `REACT_NATIVE_WEB_SETUP.md`
- `README.md`
- `README_MOBILE_FIRST.md`
- `REGISTRATION_API.md`
- `REGISTRATION_WORKFLOW.md`
- `dashboards.md`
- `eslint.config.mjs`
- `functions.md`
- `md/api/admin.md`
- `md/api/attendance.md`
- `md/api/auth.md`
- `md/api/chat.md`
- `md/api/costs-billing.md`
- `md/api/daily-plan.md`
- `md/api/issues.md`
- `md/api/machines.md`
- `md/api/material-requests.md`
- `md/api/notifications.md`
- `md/api/projects.md`
- `md/api/registration.md`
- `md/api/tasks.md`
- `md/dashboards/bidding.md`
- `md/dashboards/company-rep.md`
- `md/dashboards/connection.md`
- `md/dashboards/guest.md`
- `md/dashboards/project-manager.md`
- `md/dashboards/rental-marketplace.md`
- `md/dashboards/super-admin.md`
- `md/dashboards/supervisor.md`
- `md/dashboards/vendor.md`
- `models.md`
- `netlify.toml`
- `plan.md`
- `portfolio.md`
- `postcss.config.mjs`
- `src/app/dashboard/admin/activity/page.tsx`
- `src/app/dashboard/admin/analytics/page.tsx`
- `src/app/dashboard/admin/machines/page.tsx`
- `src/app/dashboard/admin/projects/page.tsx`
- `src/app/dashboard/admin/reports/page.tsx`
- `src/app/dashboard/admin/users/page.tsx`
- `src/app/dashboard/pm/chat/page.tsx`
- `src/app/dashboard/pm/costs/page.tsx`
- `src/app/dashboard/pm/issues/page.tsx`
- `src/app/dashboard/pm/materials/page.tsx`
- `src/app/dashboard/pm/projects/page.tsx`
- `src/app/dashboard/pm/quotes/page.tsx`
- `src/app/dashboard/pm/rentals/page.tsx`
- `src/app/dashboard/pm/reports/page.tsx`
- `src/app/dashboard/pm/settings/page.tsx`
- `src/app/dashboard/pm/tasks/page.tsx`
- `src/app/dashboard/pm/team-performance/page.tsx`
- `src/app/dashboard/pm/team/page.tsx`
- `src/app/dashboard/pm/weekly/page.tsx`
- `src/app/dashboard/supervisor/attendance/page.tsx`
- `src/app/dashboard/supervisor/daily-plan/page.tsx`
- `src/app/dashboard/supervisor/projects/[projectId]/page.tsx`
- `src/app/dashboard/supervisor/projects/page.tsx`
- `src/app/dashboard/supervisor/reports/[reportId]/page.tsx`
- `src/app/dashboard/supervisor/reports/page.tsx`
- `src/app/dashboard/supervisor/settings/page.tsx`
- `src/app/dashboard/supervisor/summary/page.tsx`
- `src/app/dashboard/supervisor/tasks/page.tsx`
- `src/app/dashboard/vendor/billing/page.tsx`
- `src/app/dashboard/vendor/earnings/page.tsx`
- `src/app/dashboard/vendor/fleet/page.tsx`
- `src/app/dashboard/vendor/inventory/page.tsx`
- `src/app/dashboard/vendor/order-history/page.tsx`
- `src/app/dashboard/vendor/orders/page.tsx`
- `src/app/dashboard/vendor/performance/page.tsx`
- `src/app/dashboard/vendor/rentals/page.tsx`
- `src/app/dashboard/vendor/requests/page.tsx`
- `src/app/layout.tsx`
- `src/app/login/page.tsx`
- `src/app/page.tsx`
- `src/app/verify/page.tsx`
- `src/components/dashboard/admin/UserManagement.tsx`
- `src/components/dashboard/pm/ProjectCreationWizard.tsx`
- `src/components/dashboard/pm/ReviewStep.tsx`
- `src/components/dashboard/shared/BidForm.tsx`
- `src/components/dashboard/shared/NotificationBell.tsx`
- `src/components/dashboard/shared/ProgressBar.tsx`
- `src/components/dashboard/shared/ProjectCard.tsx`
- `src/components/dashboard/supervisor/DailyReportForm.tsx`
- `src/components/dashboard/vendor/RentalListingForm.tsx`
- `src/components/providers/theme-provider.tsx`
- `src/components/sections/modern-hero.tsx`
- `src/components/ui/button.tsx`
- `tailwind.config.ts`
- `tsconfig.json`
- `ui.md`

## old project, unchanged (69)

- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`
- `src/app/dashboard/loading.tsx`
- `src/app/dashboard/not-found.tsx`
- `src/app/dashboard/pm/projects/new/page.tsx`
- `src/app/dashboard/vendor/fleet/new/page.tsx`
- `src/app/error.tsx`
- `src/app/favicon.ico`
- `src/app/loading.tsx`
- `src/app/not-found.tsx`
- `src/app/register-new/page.tsx`
- `src/app/register/page.tsx`
- `src/components/animated/animated-button.tsx`
- `src/components/animated/animated-stats.tsx`
- `src/components/animated/bidding-system.tsx`
- `src/components/animated/infinite-carousel.tsx`
- `src/components/animated/tender-graph.tsx`
- `src/components/dashboard/pm/BidReview.tsx`
- `src/components/dashboard/pm/DepartmentsStep.tsx`
- `src/components/dashboard/pm/ProjectDetailsStep.tsx`
- `src/components/dashboard/pm/index.ts`
- `src/components/dashboard/shared/ActivityFeed.tsx`
- `src/components/dashboard/shared/DataTable.tsx`
- `src/components/dashboard/shared/DeptSelector.tsx`
- `src/components/dashboard/shared/EmptyState.tsx`
- `src/components/dashboard/shared/LoadingSkeleton.tsx`
- `src/components/dashboard/shared/MachineCard.tsx`
- `src/components/dashboard/shared/QuickAction.tsx`
- `src/components/dashboard/shared/StatusBadge.tsx`
- `src/components/dashboard/shared/StepIndicator.tsx`
- `src/components/dashboard/shared/Timeline.tsx`
- `src/components/dashboard/shared/WorkPackageCard.tsx`
- `src/components/dashboard/shared/index.ts`
- `src/components/portfolio/cta-section.tsx`
- `src/components/portfolio/feature-card.tsx`
- `src/components/portfolio/footer.tsx`
- `src/components/portfolio/hero-section.tsx`
- `src/components/portfolio/location-pin.tsx`
- `src/components/portfolio/navbar.tsx`
- `src/components/portfolio/stakeholder-item.tsx`
- `src/components/portfolio/stakeholder-logo.tsx`
- `src/components/portfolio/stat-card.tsx`
- `src/components/register/RegistrationWizard.tsx`
- `src/components/register/index.ts`
- `src/components/register/layout/StepIndicator.tsx`
- `src/components/register/shared/FileUploader.tsx`
- `src/components/register/shared/FormInput.tsx`
- `src/components/register/shared/FormSelect.tsx`
- `src/components/register/steps/ProjectManagerDetails.tsx`
- `src/components/register/steps/SupervisorDetails.tsx`
- `src/components/sections/stakeholder-section.tsx`
- `src/components/theme-provider.tsx`
- `src/components/theme-toggle.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/container.tsx`
- `src/components/ui/divider.tsx`
- `src/components/ui/grid.tsx`
- `src/components/ui/heading.tsx`
- `src/components/ui/highlight.tsx`
- `src/components/ui/icon-wrapper.tsx`
- `src/components/ui/mobile-menu-icon.tsx`
- `src/components/ui/section.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/spacer.tsx`
- `src/lib/utils.ts`

## recovered (48)

- `md/api/README.md`
- `md/dashboards/README.md`
- `next.config.ts`
- `package.json`
- `src/app/dashboard/company/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/pm/bids/page.tsx`
- `src/app/dashboard/pm/page.tsx`
- `src/app/dashboard/pm/vendors/[vendorId]/page.tsx`
- `src/app/dashboard/vendor/bids/browse/page.tsx`
- `src/app/dashboard/vendor/bids/page.tsx`
- `src/app/dashboard/vendor/tenders/[tenderId]/proposal/page.tsx`
- `src/app/partner/documents/page.tsx`
- `src/app/partner/layout.tsx`
- `src/app/partner/page.tsx`
- `src/app/partner/qualification/[step]/page.tsx`
- `src/app/partner/qualification/page.tsx`
- `src/app/partner/tenders/[tenderId]/page.tsx`
- `src/app/partner/tenders/page.tsx`
- `src/components/PermissionGuard.tsx`
- `src/components/dashboard/redesign/ConsultantWorkspace.tsx`
- `src/components/dashboard/redesign/ContractorWorkspace.tsx`
- `src/components/dashboard/redesign/GovernanceWorkspace.tsx`
- `src/components/dashboard/redesign/RedesignKit.tsx`
- `src/components/dashboard/redesign/SubcontractorWorkspace.tsx`
- `src/components/dashboard/redesign/VendorDashboardInsights.tsx`
- `src/components/dashboard/redesign/VendorProfileWorkspace.tsx`
- `src/components/dashboard/shared/RoleDashboard.tsx`
- `src/components/dashboard/shared/Sidebar.tsx`
- `src/components/register/RegistrationWizardContent.tsx`
- `src/components/register/layout/RegistrationLayout.tsx`
- `src/components/register/steps/Step1AccountCreation.tsx`
- `src/components/register/steps/Step2ProfileSetup.tsx`
- `src/components/register/steps/Step4DocumentUpload.tsx`
- `src/components/register/steps/Step5VerificationPending.tsx`
- `src/components/register/steps/VendorDetails.tsx`
- `src/context/AuthContext.tsx`
- `src/context/RegistrationContext.tsx`
- `src/features/partner/FieldInput.tsx`
- `src/features/partner/PartnerProvider.tsx`
- `src/features/partner/PartnerShell.tsx`
- `src/features/partner/Stepper.tsx`
- `src/features/partner/api.ts`
- `src/features/partner/tenderApi.ts`
- `src/features/tender/evaluationApi.ts`
- `src/lib/api.ts`
- `src/proxy.ts`

## recovered (first recovery) (24)

- `src/app/dashboard/admin/page.tsx`
- `src/app/dashboard/consultant/page.tsx`
- `src/app/dashboard/contractor/page.tsx`
- `src/app/dashboard/pm/governance/page.tsx`
- `src/app/dashboard/pm/projects/[projectId]/corridor/page.tsx`
- `src/app/dashboard/pm/projects/[projectId]/page.tsx`
- `src/app/dashboard/pm/projects/[projectId]/sections/page.tsx`
- `src/app/dashboard/pm/quality-commercial/page.tsx`
- `src/app/dashboard/subcontractor/page.tsx`
- `src/app/dashboard/supervisor/page.tsx`
- `src/app/dashboard/supervisor/reports/new/page.tsx`
- `src/app/dashboard/vendor/page.tsx`
- `src/app/globals.css`
- `src/components/dashboard/redesign/AiTenderWorkspace.tsx`
- `src/components/dashboard/redesign/CommunicationContextPanel.tsx`
- `src/components/dashboard/redesign/CorridorWorkspace.tsx`
- `src/components/dashboard/redesign/MachineHistory.tsx`
- `src/components/dashboard/redesign/PortfolioSchedule.tsx`
- `src/components/dashboard/redesign/ProjectControlSummary.tsx`
- `src/components/dashboard/redesign/ProjectLinkedRecords.tsx`
- `src/components/dashboard/redesign/QualityCommercialWorkspace.tsx`
- `src/components/dashboard/redesign/SectionsWorkspace.tsx`
- `src/components/dashboard/shared/Header.tsx`
- `src/components/dashboard/shared/StatCard.tsx`

## MISSING (4)

- `.env.example`
- `public/images/metro.jpg`
- `public/images/railway.jpg`
- `src/components/enterprise/EnterpriseDataGrid.tsx`

## old project; newer version only partly recovered (3)

- `src/app/dashboard/guest/page.tsx`
- `src/app/dashboard/vendor/fleet/[machineId]/page.tsx`
- `src/components/dashboard/vendor/MachineForm.tsx`

## old project, brought over because an outdated file still imports it (13)

- `src/components/sections/testimonials-section.tsx`
- `src/components/sections/trust-section.tsx`
- `src/components/sections/how-it-works.tsx`
- `src/components/sections/pricing-section.tsx`
- `src/components/sections/faq-section.tsx`
- `src/components/dashboard/supervisor/erp/QualityTerminal.tsx`
- `src/components/dashboard/supervisor/erp/SiteLogistics.tsx`
- `src/components/dashboard/supervisor/erp/TaskBoard.tsx`
- `src/components/dashboard/pm/BiddingStep.tsx`
- `src/components/ui/marquee.tsx`
- `src/components/ui/bento-grid.tsx`
- `src/components/ui/shiny-button.tsx`
- `src/components/ui/accordion.tsx`
