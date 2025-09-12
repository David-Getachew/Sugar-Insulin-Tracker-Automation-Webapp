# Changelog

## [2.1.0] - 2025-09-11

### Added
- `x-webhook-secret` header to all webhook requests for enhanced security
- Delete button for unsaved contact rows
- Inline validation for new contact fields (Telegram IDs and secondary emails)

### Changed
- Emergency form data handling simplified to pass arrays directly to database
- Telegram relation persistence fixed to properly save in "ID:relation" format
- Emergency form webhook delivery with improved error handling
- Addition of Multi-select dropdown for symptoms and actions taken in the emergency form
- Full name field shows inline save message when changed
- Logout button color changed to match Delete button red (#dc2626)
- Inline Edit/Delete icons for contacts no longer have hover background effects
- Edit/Delete icons show tooltips on hover

### Fixed
- Emergency form submissions now work correctly without "malformed array literal" error
- Data type consistency between form, database, and webhook payloads
- Telegram ID relations properly persist through both inline and page-level saves
- Multi-select pills can be removed by clicking anywhere on the pill

### Security
- Added `x-webhook-secret` header for webhook authentication
- Environment variables properly used for webhook URL (VITE_N8N_EMERGENCY_WEBHOOK_URL)
- No database schema changes or RLS policy modifications
- No auth/login logic changes

### Removed
- All development/testing code for production readiness
- Developer console logging for webhook URL in dev mode

## [2.0.1] - 2025-09-08

### 🐛 Bug Fixes
- **Profile Save Button**: Fixed issue preventing profile updates by removing overly strict contact validation
- **Password Change**: Implemented proper password change functionality using Supabase auth instead of placeholder message
- **Dashboard Charts**: Fixed data sorting to display readings in proper chronological order (oldest left, newest right)
- **Emergency Form**: Made "Actions Taken" field optional with clear labeling

### 🎨 UI/UX Improvements
- **Secondary Emails Display**: Reverted to previous expanded form layout for better user experience
- **Dashboard Mock Data**: Removed all mock data and implemented clear "no data" messages across all components
- **Consistent Messaging**: Unified empty state messages across dashboard components

### 🧹 Codebase Cleanup
- **Branding Removal**: Eliminated all "dyad-generated-app" references and branding
- **Dependency Cleanup**: Removed unused dyad dependencies from package.json
- **Component Removal**: Deleted the MadeWithDyad component and all references

## [2.0.0] - 2025-09-10

### Summary
First integrated release combining frontend and Supabase wiring plus multiple bug fixes.

### Features
- Supabase integration for authentication and profile fetch
- Auth context and `useAuth()` hook with proper session handling
- Dashboard with line charts and bar charts for daily readings and insulin doses
- Daily readings form with upsert behavior (user_id + date)
- Emergency events form that inserts into `emergency_events` and POSTs to webhook
- Profiles page (edit full name, secondary emails, telegram ids, change password)
- Demo accounts flagged by `profiles.is_demo` are read-only

### Fixes
- Removed mock data in readings history
- Profile "Save Changes" button now persists updates
- Symptoms text field accepts input; "Actions Taken" field marked optional
- Insulin dose inputs no longer auto-correct values
- Dashboard state stabilized to avoid reloads when switching browser tabs
- Charts fixed to display chronological order
- UI improvements: disabled submit buttons during requests, popups/toasts for errors, skeletons for loading states

## [1.0.0] - Initial Release
- Initial frontend-only implementation
- Basic UI components and routing
- Mock data and static functionality
- shadcn/ui component library integration