# Evolution of Todo - Frontend

Phase II Full-Stack Web Application - Next.js Frontend

## Overview

Responsive web UI for todo management with user authentication, real-time updates, and mobile-friendly design.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: CSS (utility classes)
- **Testing**: Jest + React Testing Library

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (see backend/README.md)

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Application will start at: http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Application Structure

```
frontend/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── signup/        # Signup page
│   │   ├── signin/        # Signin page
│   │   └── todos/         # Todo list page (protected)
│   ├── components/
│   │   ├── auth/          # Auth forms, guards
│   │   ├── todos/         # Todo components
│   │   ├── ui/            # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── lib/
│   │   ├── api/           # API client functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── styles/            # Global styles
└── tests/                 # Unit and component tests
```

## Pages

- `/` - Landing page (redirects based on auth status)
- `/signup` - User registration
- `/signin` - User authentication
- `/todos` - Todo list (protected route)

## Features

### Authentication
- User registration with email/password
- User signin with session persistence
- Protected routes (redirect to signin if not authenticated)
- Sign out functionality

### Todo Management
- View all todos (newest first)
- Create new todo with title and description
- Edit existing todos
- Toggle completion status (checkbox)
- Delete todos with confirmation
- Empty state when no todos

### Responsive Design
- Mobile-first design (375px+)
- Touch-friendly UI elements
- Adaptive layouts for tablet and desktop

## Development Workflow

1. Start backend API (see backend/README.md)
2. Start frontend dev server: `npm run dev`
3. Navigate to http://localhost:3000
4. Make changes (hot reload enabled)
5. Test in browser
6. Run linters: `npm run lint`

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- TodoItem.test.tsx
```

## Troubleshooting

**Cannot connect to API**:
- Verify backend is running at http://localhost:8000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check CORS configuration in backend

**Session not persisting**:
- Check cookies in browser dev tools
- Verify backend sets httpOnly cookie
- Check sameSite settings

**Build errors**:
- Delete `.next/` directory
- Delete `node_modules/`
- Reinstall: `npm install`
- Rebuild: `npm run build`

## Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (required)

## License

Evolution of Todo - Phase II
