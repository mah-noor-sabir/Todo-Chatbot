# Taskify - Todo Chatbot

A progressive todo application with AI-powered chatbot functionality demonstrating Spec-Driven Development (SDD) methodology across multiple phases.

## Current Phase: Phase IV - AI Enhancement

Full-stack web application with AI chatbot integration for natural language task management, user authentication, database persistence, and responsive UI.

### Features

- AI-powered chatbot for task management (natural language processing)
- User registration and authentication (email/password)
- Session-based authentication with 24-hour persistence
- Protected routes and data isolation
- Todo CRUD operations (Create, Read, Update, Delete)
- Toggle completion status
- Advanced filtering and sorting
- Responsive UI (mobile and desktop)
- RESTful API backend
- Neon PostgreSQL database persistence

## Project Structure

```
Todo-Chatbot/
├── backend/              # Python FastAPI REST API
│   ├── src/              # Source code
│   ├── tests/            # Backend tests
│   ├── migrations/       # Database migrations
│   └── README.md         # Backend setup guide
├── frontend/             # Next.js React application
│   ├── src/              # Source code
│   ├── tests/            # Frontend tests
│   └── README.md         # Frontend setup guide for Vercel deployment
├── specs/                # Spec-Driven Development artifacts
│   └── 004-ai-chatbot/   # AI Chatbot specifications
│       ├── spec.md       # Feature specification
│       ├── plan.md       # Technical plan
│       ├── tasks.md      # Implementation tasks
│       └── contracts/    # API contracts (OpenAPI)
└── .specify/             # SDD framework configuration
```

## Deployment

### Frontend (Vercel)

The frontend is designed for easy deployment on Vercel:

1. Fork this repository
2. Go to [Vercel](https://vercel.com) and connect your GitHub account
3. Import your forked repository
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - URL of your deployed backend (e.g., `https://your-backend.onrender.com`)
5. Deploy!

### Backend (Render/DigitalOcean/AWS)

Deploy the backend separately and update the `NEXT_PUBLIC_API_URL` environment variable in the frontend deployment.

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- Neon PostgreSQL account or local PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure .env (copy from .env.example)
# Add your DATABASE_URL, SECRET_KEY, and OPENROUTER_API_KEY

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install

# Configure .env.local (copy from .env.local.example)

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

## Usage

1. Navigate to http://localhost:3000 (or your deployed URL)
2. Click "Sign up" to create an account
3. Enter email and password (min 8 characters)
4. Automatically signed in and redirected to dashboard
5. Use the chatbot to create tasks with natural language (e.g., "Add a task to buy groceries")
6. View, edit, or delete tasks as needed
7. Use filtering and sorting options to manage your tasks

## API Documentation

Interactive API docs available when backend is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Architecture

### Backend (Three-Layer Architecture)

- **Domain Layer**: Models (User, Todo) - framework-independent
- **Application Layer**: Services (AuthService, TodoService, AgentService) - business logic
- **Infrastructure Layer**: API routes, repositories, database, AI integration

### Frontend (Component-Based)

- **Pages**: App Router file-based routing (/signup, /signin, /todos)
- **Components**: Reusable UI (forms, modals, buttons, inputs, chat components)
- **Hooks**: State management (useAuth, useTodos, useMultiChat)
- **API Client**: Type-safe API communication

### Database

- **users**: User accounts (email, password_hash, timestamps)
- **todos**: Todo items (title, description, is_completed, user_id FK)
- **conversations**: Chat conversation history
- **messages**: Individual chat messages
- **Relationships**: User (1) → (0..N) Todo/Conversation (CASCADE DELETE)

## Development Phases

- **Phase I**: Console application (completed)
- **Phase II**: Full-stack web app (completed)
- **Phase III**: Real-time collaboration (completed)
- **Phase IV**: AI enhancement (current) 
- **Phase V**: Enterprise features (planned)

## Documentation

- [Backend Setup](backend/README.md)
- [Frontend Setup](frontend/README.md)
- [Phase IV AI Chatbot Specification](specs/004-ai-chatbot/spec.md)
- [Technical Plan](specs/004-ai-chatbot/plan.md)
- [Implementation Tasks](specs/004-ai-chatbot/tasks.md)
- [Quickstart Guide](specs/004-ai-chatbot/quickstart.md)

## Contributing

This project follows Spec-Driven Development (SDD):
1. Specification → Planning → Tasks → Implementation
2. No code changes without approved tasks
3. All changes must trace back to specifications

See `.specify/memory/constitution.md` for complete development principles.

## License

Taskify Todo Chatbot - Educational Project
