# Sugar Insulin Tracker

A modern web application for tracking blood sugar levels and insulin dosage with full Supabase backend integration and demo read-only functionality.

## Overview

This application provides a comprehensive solution for monitoring and managing diabetes-related data. It features:

- Real-time blood sugar and insulin tracking
- Emergency event reporting with webhook notifications
- User profile management with contact information
- Data visualization through interactive charts
- Demo mode for safe testing and evaluation

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
git clone https://github.com/David-Getachew/Sugar-Insulin-Tracker-Automation-Webapp.git
cd Sugar-Insulin-Tracker-Automation-Webapp
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
VITE_N8N_EMERGENCY_WEBHOOK_URL=https://your-n8n-instance.com/webhook/emergency
```

### 3. Start Development
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

## Features

### Core Functionality
- **Supabase Authentication**: Secure user login and session management
- **Real-Time Data Sync**: Live updates with Supabase real-time subscriptions
- **User Profile Management**: Comprehensive user settings and contact management
- **Dashboard Analytics**: Visual charts for tracking sugar levels and insulin doses over time
- **Data Entry Forms**: Easy-to-use forms for logging readings and emergency situations
- **Emergency Reporting**: Automatic webhook notifications for emergency situations

### Demo Mode
When logged in with a demo account (`is_demo: true`), users will see:
- 🟡 Warning banners on all pages
- 🔒 Disabled form submissions
- 📊 Sample data for demonstration
- 🚫 No data persistence

## Security Note
- Do not commit service-role keys or other secrets.
- If any keys were accidentally committed earlier, rotate them immediately.

## Changelog
For detailed release notes, please see [CHANGELOG.md](CHANGELOG.md)