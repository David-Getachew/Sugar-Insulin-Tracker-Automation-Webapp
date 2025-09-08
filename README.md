# Sugar Insulin Tracker - Frontend Only

A modern web application for tracking blood sugar levels and insulin dosage, built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Analytics**: Visual charts for tracking sugar levels and insulin doses over time
- **Data Entry Forms**: Easy-to-use forms for logging readings and medications  
- **Interactive Charts**: Built with Recharts for clear data visualization
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Modern UI Components**: Powered by shadcn/ui component library
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **State Management**: TanStack Query

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/David-Getachew/Sugar-Insulin-Tracker-Automation-Webapp-FrontEndOnly.git
   cd Sugar-Insulin-Tracker-Automation-Webapp-FrontEndOnly
2. **Install dependencies**
```bash
pnpm install
```
# or
```bash
npm install
```
Start development server
```bash
pnpm dev
```
# or
```bash
npm run dev
```
Open your browser
Navigate to http://localhost:5173

**Available Scripts**
```
pnpm dev - Start development server
pnpm build - Build for production
pnpm build:dev - Build for development
pnpm preview - Preview production build
pnpm lint - Run ESLint
```

**Pages & Features**
Dashboard (/) - Overview with charts and recent readings
Forms (/forms) - Add new sugar level and insulin dose entries
Profile (/profile) - User profile and settings
Login (/login) - Authentication (UI ready)

**UI Components**
Built with a comprehensive set of components including:
Forms (inputs, selects, checkboxes)
Data display (tables, charts, cards)
Navigation (menus, breadcrumbs, pagination)
Feedback (alerts, toasts, dialogs)
And many more from shadcn/ui

**Development**
This project uses:
ESLint for code linting
TypeScript for type checking
Tailwind CSS for styling
Vite for fast development and building

**Deployment**
The project is configured for easy deployment on Vercel with the included vercel.json configuration.
```bash
pnpm build
```
The built files will be in the dist directory.
**Contributing**
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

**📄 License**
This project is open source and available under the MIT License.

