# Sugar Insulin Tracker v2.0.0 - Supabase Integration

A modern web application for tracking blood sugar levels and insulin dosage, now with full Supabase backend integration and demo read-only functionality.

## 🚀 Latest Updates

- ✅ **Full Supabase Integration**: Authentication, real-time data, and user management
- ✅ **Demo Read-Only Mode**: Safe demo accounts with visual indicators
- ✅ **Emergency Webhooks**: N8N integration for emergency notifications
- ✅ **User-Scoped Data**: All queries properly filtered by authenticated user
- ✅ **Production Ready**: Comprehensive QA testing and validation

## Features

### Core Functionality
- **Supabase Authentication**: Secure user login and session management
- **Real-Time Data Sync**: Live updates with Supabase real-time subscriptions
- **User Profile Management**: Comprehensive user settings and contact management
- **Dashboard Analytics**: Visual charts for tracking sugar levels and insulin doses over time
- **Data Entry Forms**: Easy-to-use forms for logging readings and emergency situations
- **Emergency Reporting**: Automatic webhook notifications for emergency situations

### Demo & Security Features
- **Demo Read-Only Mode**: Safe demonstration with clear visual indicators
- **User Data Isolation**: All queries scoped to authenticated user
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Environment-Based Configuration**: Secure credential management

### UI & Experience
- **Interactive Charts**: Built with Recharts for clear data visualization
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Modern UI Components**: Powered by shadcn/ui component library
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Backend**: Supabase (Database, Auth, Real-time)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **State Management**: TanStack Query + Context API
- **Webhooks**: N8N integration for emergency notifications

## Installation & Setup

### 1. Clone and Install
```bash
git clone https://github.com/David-Getachew/Sugar-Insulin-Tracker-Automation-Webapp-FrontEndOnly.git
cd Sugar-Insulin-Tracker-Automation-Webapp-FrontEndOnly
pnpm install  # or npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Update `.env` with your actual values:
```bash
# Supabase Configuration
VITE_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key

# Demo User Credentials  
DEMO_USER_EMAIL=demo@example.com
DEMO_USER_PASSWORD=password

# N8N Webhook URL for Emergency Notifications
N8N_EMERGENCY_WEBHOOK_URL=https://your-n8n-instance.com/webhook/emergency
```

### 3. Supabase Setup
Ensure your Supabase project has the following tables with RLS enabled:

- `profiles` - User profile information
- `daily_readings` - Daily sugar and insulin readings
- `emergencies` - Emergency situation records

### 4. Start Development
```bash
pnpm dev  # Starts server on http://localhost:8080
```

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production  
pnpm build:dev    # Build for development
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

## Quality Assurance

Run the automated QA script to verify your setup:

```bash
# Linux/macOS
./qa.sh

# Windows
.\qa.ps1
```

Or check the comprehensive QA report: `QA_REPORT.md`

## Pages & Features

- **Login** (`/login`) - Supabase authentication with demo account support
- **Dashboard** (`/dashboard`) - Real-time analytics with charts and data visualization
- **Forms** (`/forms`) - Data entry for daily readings and emergency situations
- **Profile** (`/profile`) - User settings, contact management, and account preferences

### Demo Mode
When logged in with a demo account (`is_demo: true`), users will see:
- 🟡 Warning banners on all pages
- 🔒 Disabled form submissions
- 📊 Sample data for demonstration
- 🚫 No data persistence

### Emergency Features
- Automatic webhook notifications to N8N
- Database logging of all emergency events
- Medication tracking and symptom documentation

## Authentication & Security

- **Supabase Auth**: Secure authentication with session management
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Data Isolation**: All database queries scoped to `user_id`
- **Demo Account Safety**: Read-only mode prevents data corruption
- **Environment Security**: Credentials managed through environment variables

## Development

This project uses:
- **ESLint** for code linting
- **TypeScript** for type checking
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **Supabase** for backend services
- **Custom Hooks** for database operations and authentication

### Key Components
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/hooks/useDatabase.ts` - Database operations with user scoping
- `src/lib/supabase.ts` - Supabase client configuration
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/types/database.ts` - TypeScript database types

## Deployment

### Environment Setup
1. Configure your production Supabase project
2. Set up N8N webhook endpoints
3. Create demo user accounts with `is_demo: true`
4. Deploy environment variables

### Build & Deploy
```bash
pnpm build
```

The built files will be in the `dist` directory. The project is configured for Vercel deployment with the included `vercel.json`.

### Database Requirements
Ensure your Supabase database has:
- Row Level Security (RLS) enabled
- Proper user policies for data isolation  
- Demo user accounts configured
- Webhook endpoints tested

## Branch Information

This integration was developed on the `feature/supabase-integration-gemini` branch, which includes:

- Complete Supabase integration
- Demo read-only functionality
- Emergency webhook integration
- Comprehensive QA testing
- Updated documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Run QA tests (`./qa.sh` or `./qa.ps1`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Files Added/Modified

### New Files
- `src/lib/supabase.ts` - Supabase client
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/hooks/useDatabase.ts` - Database operations
- `src/types/database.ts` - Database types
- `.env` & `.env.example` - Environment configuration
- `qa.sh` & `qa.ps1` - QA automation scripts
- `QA_REPORT.md` - Comprehensive testing report

### Modified Files
- `src/App.tsx` - Added AuthProvider and protected routes
- `src/pages/Login.tsx` - Supabase authentication integration
- `src/pages/Forms.tsx` - Database integration and demo mode
- `src/pages/Profile.tsx` - User profile management
- `src/pages/Dashboard.tsx` - Real data integration
- `src/components/layout/MainLayout.tsx` - Authentication-aware navigation
- Chart and table components - Real data support

## 📄 License

This project is open source and available under the MIT License.