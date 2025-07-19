# Financial Dashboard Application

## Overview

This is a modern financial dashboard application built with React, TypeScript, and Express.js. The application provides users with an AI-powered interface to manage their finances, track expenses, visualize financial data through charts, and interact with an intelligent chatbot for financial assistance.

## User Preferences

Preferred communication style: Simple, everyday language.
UX preferences: AI chat modal should open automatically when user focuses on the global input field for more intuitive interaction flow.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Charts**: Chart.js with React wrappers for financial data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Development**: Hot module replacement with Vite integration

### Database Strategy
- **Primary Database**: PostgreSQL (configured via Drizzle)
- **Connection**: Neon Database serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Current Storage**: In-memory storage implementation with interface for easy database migration

## Key Components

### AI Chat System
- **Global AI Input**: Fixed bottom input for natural language financial queries
- **Chat Modal**: Full-screen chat interface with message history
- **Voice Input**: Mock voice recognition capability
- **Smart Processing**: Simulated AI responses for financial operations

### Financial Data Management
- **Summary Cards**: Balance, income, expenses, and savings goal tracking
- **Transaction Management**: Recent transactions with categorization and icons
- **Category Management**: Expense categorization with color coding
- **Chart Visualizations**: 
  - Pie charts for expense categories
  - Line charts for monthly trends
  - Bar charts for income vs expenses comparison

### UI Component System
- **Design System**: Shadcn/ui with neutral theme and consistent spacing
- **Component Library**: Comprehensive set of reusable components
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Loading States**: Skeleton loading and spinner implementations

## Data Flow

### Client-Side Data Flow
1. **Financial Data Hook** (`useFinancialData`) manages all financial state
2. **AI Chat Hook** (`useAIChat`) handles chat interactions and message processing
3. **React Query** manages server state and caching (prepared for API integration)
4. **Mock Data** currently provides realistic financial scenarios

### Server-Side Data Flow
1. **Express Routes** handle API endpoints (currently minimal setup)
2. **Storage Interface** abstracts data operations for easy database integration
3. **Memory Storage** provides immediate functionality with user/authentication schema
4. **Database Migration Path** ready via Drizzle configuration

### AI Processing Simulation
1. User input processed through natural language understanding
2. Transaction extraction and categorization
3. Response generation with financial insights
4. Real-time UI updates with new transactions

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TanStack React Query
- **TypeScript**: Full TypeScript support with strict configuration
- **Build Tools**: Vite, esbuild for production builds

### UI and Styling
- **Radix UI**: Comprehensive component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization library
- **Lucide React**: Icon library

### Backend Dependencies
- **Express.js**: Web application framework
- **Drizzle ORM**: TypeScript-first ORM
- **PostgreSQL**: Database driver (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL sessions

### Development Tools
- **Replit Integration**: Cartographer and runtime error overlay
- **Hot Reload**: Vite development server with HMR
- **Code Quality**: ESLint and TypeScript checking

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Module Replacement**: Vite provides instant feedback
- **TypeScript Checking**: `npm run check` for type validation
- **Database Operations**: `npm run db:push` for schema updates

### Production Build Process
1. **Frontend Build**: Vite optimizes and bundles React application
2. **Backend Build**: esbuild bundles Express server with external packages
3. **Static Assets**: Served from `dist/public` directory
4. **Database Setup**: Drizzle migrations applied to PostgreSQL instance

### Hosting Considerations
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection
- **Session Storage**: PostgreSQL-based sessions for scalability
- **Static Files**: Frontend assets served by Express in production
- **API Routes**: All API endpoints prefixed with `/api`

### Scalability Preparations
- **Database Interface**: Abstract storage layer for easy database switching
- **Modular Architecture**: Separated concerns between frontend, backend, and data
- **Component Reusability**: Comprehensive UI component library
- **State Management**: React Query prepared for complex server state scenarios