<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.2.0 → 1.3.0 (MINOR - Phase IV AI/Agent architecture principles)

Modified Principles:
- New Section VI: AI Agent Architecture Rules - Comprehensive governance for
  Phase IV AI Chatbot implementation with MCP and OpenAI Agents SDK
- Phase IV Scope Definition expanded with concrete AI/Agent implementation
  requirements and architectural constraints

Added Sections:
- Section VI: AI Agent Architecture Rules (10 core principles)
  1. Stateless Backend Architecture
  2. AI Agent Access Restrictions
  3. MCP Tool Mandatory Interface
  4. Stateless MCP Tool Design
  5. Chat API Persistence Requirements
  6. Natural Language Intent Mapping
  7. Specification Adherence
  8. User Communication Standards
  9. Error Handling Requirements
  10. Server Restart Resilience
- Phase IV detailed scope expansion in Phase Scope Definitions

Removed Sections: None

Templates Requiring Updates:
- .specify/templates/plan-template.md - ✅ Compatible (Phase IV plans will
  validate against new AI/Agent architecture rules)
- .specify/templates/spec-template.md - ✅ Compatible (Phase IV specs can
  reference AI/Agent requirements)
- .specify/templates/tasks-template.md - ✅ Compatible (Phase IV tasks will
  validate stateless architecture and MCP tool usage)
- .specify/templates/phr-template.prompt.md - ✅ Compatible (No changes needed)

Follow-up TODOs:
- When Phase IV spec is created, validate AI agent architecture against
  Section VI principles
- Ensure Phase IV tasks explicitly test stateless backend and MCP tool usage
- Document MCP tool contracts in Phase IV spec
- Validate OpenAI Agents SDK integration against constitutional rules
================================================================================
-->

# Evolution of Todo Project Constitution

## Core Principles

### I. Spec-Driven Development (Mandatory)

All development work MUST follow the Spec-Driven Development (SDD) methodology. This is non-negotiable.

**Execution Flow**:
1. **Constitution** - This document defines immutable project principles
2. **Specification** - Feature requirements documented in `specs/<feature>/spec.md`
3. **Plan** - Technical architecture documented in `specs/<feature>/plan.md`
4. **Tasks** - Implementable work items documented in `specs/<feature>/tasks.md`
5. **Implement** - Code written only after tasks are approved

**Enforcement Rules**:
- No agent may write production code without an approved specification
- No agent may implement features without an approved task list
- All code changes MUST trace back to an approved task
- Specifications MUST be approved before planning begins
- Plans MUST be approved before task generation begins

### II. Agent Behavior Rules

AI agents operating on this project MUST adhere to strict behavioral constraints.

**Prohibited Actions**:
- Manual coding by humans is NOT permitted during agent-driven phases
- Feature invention beyond approved specifications is FORBIDDEN
- Deviation from approved specifications is FORBIDDEN
- Code-level refinement without spec-level approval is FORBIDDEN

**Required Behaviors**:
- All refinements MUST occur at the specification level, not code level
- Agents MUST request clarification when requirements are ambiguous
- Agents MUST halt and escalate when encountering undefined edge cases
- Agents MUST document all decisions via Prompt History Records (PHR)
- Agents MUST suggest ADRs for architecturally significant decisions

**Refinement Protocol**:
1. Identify issue or improvement opportunity
2. Document proposed change in specification
3. Obtain approval for specification change
4. Update plan if architecture is affected
5. Regenerate tasks from updated plan
6. Implement from approved tasks only

### III. Phase Governance

The Evolution of Todo project is divided into five phases. Each phase is strictly scoped.

**Phase Isolation Rules**:
- Each phase is strictly scoped by its specification document
- Future-phase features MUST NOT leak into earlier phases
- Architecture may evolve ONLY through updated specs and plans
- Cross-phase dependencies MUST be explicitly documented
- Phase completion requires all tasks marked complete and validated

**Phase Scope Reference**:
- **Phase I**: Enhanced Todo operations with organization, automation, and discovery (console-only, in-memory)
- **Phase II**: Full-stack web application with multi-user support, authentication, database persistence
- **Phase III**: Real-time sync, collaboration features, containerization
- **Phase IV**: AI-powered features, intelligent suggestions
- **Phase V**: Enterprise features, analytics, integrations

**Phase Transition Requirements**:
1. All Phase N tasks completed and validated
2. All Phase N tests passing
3. Phase N specification marked as "Complete"
4. Phase N+1 specification approved before any Phase N+1 work begins

### IV. Technology Constraints

The following technology stack is mandated for all phases.

**Phase I Technology Stack**:
- **Language**: Python 3.11+
- **Architecture**: Console-only application
- **Storage**: In-memory only (no persistence)
- **CLI Library**: Rich (for professional console output)
- **Testing**: pytest
- **Prohibited**: Databases, web frameworks, authentication, network functionality

**Phase II Technology Stack**:
- **Backend**:
  - Language: Python 3.11+
  - Framework: Python REST API (FastAPI recommended)
  - ORM/Data Layer: SQLModel or equivalent
  - Database: Neon Serverless PostgreSQL
  - Testing: pytest with API testing extensions
- **Frontend**:
  - Framework: Next.js (React, TypeScript)
  - Authentication: Better Auth (signup/signin)
  - Styling: As specified per feature requirements
- **Architecture**: Full-stack web application
- **Deployment**: Web-accessible (localhost or cloud)
- **Allowed**: User authentication, web frontend, database persistence
- **Prohibited**: AI/agent frameworks, advanced orchestration, enterprise integrations

**Phase III Technology Stack** (extends Phase II):
- **Infrastructure**:
  - Containerization: Docker
  - Orchestration: Kubernetes
  - Messaging: Kafka
  - Real-time: WebSockets or equivalent
- **Allowed**: Real-time collaboration, event streaming, container deployment
- **Prohibited**: AI/agent frameworks, enterprise integrations

**Phase IV Technology Stack** (extends Phase III):
- **AI/Agent Infrastructure**:
  - OpenAI Agents SDK
  - Model Context Protocol (MCP)
  - Natural language processing
- **Allowed**: AI-powered features, intelligent automation
- **Prohibited**: Enterprise-specific integrations not specified

**Phase V Technology Stack** (extends Phase IV):
- **Enterprise Infrastructure**:
  - Runtime: Dapr
  - Analytics: As specified per requirements
  - Integrations: Third-party APIs as needed
- **Allowed**: Enterprise features, advanced analytics, external integrations

**Technology Authorization Matrix**:

| Technology Category | Phase I | Phase II | Phase III | Phase IV | Phase V |
|---------------------|---------|----------|-----------|----------|---------|
| Database Persistence | ❌ | ✅ Neon PostgreSQL | ✅ | ✅ | ✅ |
| Web Frontend | ❌ | ✅ Next.js | ✅ | ✅ | ✅ |
| Authentication | ❌ | ✅ Better Auth | ✅ | ✅ | ✅ |
| REST API | ❌ | ✅ Python/FastAPI | ✅ | ✅ | ✅ |
| Containerization | ❌ | ❌ | ✅ Docker | ✅ | ✅ |
| Orchestration | ❌ | ❌ | ✅ Kubernetes | ✅ | ✅ |
| Event Streaming | ❌ | ❌ | ✅ Kafka | ✅ | ✅ |
| AI/Agents | ❌ | ❌ | ❌ | ✅ OpenAI SDK | ✅ |
| MCP Servers | ❌ | ❌ | ❌ | ✅ | ✅ |
| Dapr Runtime | ❌ | ❌ | ❌ | ❌ | ✅ |
| Enterprise Analytics | ❌ | ❌ | ❌ | ❌ | ✅ |

**Technology Addition Rules**:
- New technologies MUST be justified in the phase specification
- Technology choices MUST be validated against the authorization matrix above
- Technologies not authorized for current phase MUST be rejected with reference to this constitution
- Technology changes MUST be documented in an ADR
- No technology may be introduced that contradicts this constitution
- All dependencies MUST be explicitly declared in project manifests

### V. Quality Principles

All code produced under this constitution MUST meet these quality standards.

**Clean Architecture**:
- Clear separation between domain, application, and infrastructure layers
- Dependencies MUST point inward (infrastructure depends on domain, not vice versa)
- Domain entities MUST NOT depend on frameworks or external libraries
- Use cases MUST be independently testable

**Stateless Services**:
- Services MUST be stateless where cloud deployment is anticipated (Phase II onwards)
- Session state MUST be externalized to dedicated state stores
- No in-memory caches that cannot be invalidated or shared across instances
- Exception: Phase I in-memory storage is permitted for console-only operation

**Separation of Concerns**:
- API routes MUST NOT contain business logic
- Business logic MUST NOT contain database queries directly
- Data access MUST be abstracted through repository patterns
- Configuration MUST be externalized from code

**Cloud-Native Readiness**:
- All services MUST be containerizable (Phase II onwards)
- Health check endpoints MUST be implemented (Phase II onwards)
- Graceful shutdown MUST be implemented
- Logging MUST use structured format (JSON) or rich console output
- Configuration MUST support environment variables
- Secrets MUST NOT be hardcoded or committed to version control

**Testing Requirements**:
- Unit tests for all business logic
- Integration tests for API endpoints (Phase II onwards)
- Contract tests for external service interactions (Phase II onwards)
- All tests MUST pass before merge approval

### VI. AI Agent Architecture Rules

All AI-powered features (Phase IV onwards) MUST adhere to strict architectural constraints to ensure correctness, reliability, and maintainability.

**1. Stateless Backend Architecture**:
- The backend server MUST be completely stateless
- No in-memory state for conversations, tasks, or agent context
- No global variables or module-level mutable state
- All state MUST be persisted to and retrieved from the database
- Exception: Stateless request-scoped caching is permitted

**2. AI Agent Access Restrictions**:
- AI agents MUST NOT directly access the database
- AI agents MUST NOT mutate application state directly
- AI agents MUST NOT perform task operations without MCP tools
- All data access MUST be mediated through MCP tool interfaces
- Direct database imports in agent code are FORBIDDEN

**3. MCP Tool Mandatory Interface**:
- ALL task operations MUST go through MCP tools exclusively
- Required MCP tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- No task operation may bypass MCP tool layer
- MCP tools are the single source of truth for task operations
- Additional MCP tools may be added only via specification approval

**4. Stateless MCP Tool Design**:
- Each MCP tool call MUST perform a single atomic database operation
- MCP tools MUST NOT cache or store context between calls
- MCP tools MUST NOT maintain conversation state
- Each tool invocation MUST be self-contained and independent
- Tool responses MUST include all necessary context for agent decisions

**5. Chat API Persistence Requirements**:
- The Chat API MUST fetch conversation history from database on every request
- The Chat API MUST store both user and assistant messages in database
- The Chat API MUST return: `conversation_id`, `response`, and `tool_calls`
- No conversation context may be held in memory between requests
- Session/conversation continuity MUST be achieved through database reads

**6. Natural Language Intent Mapping**:
- AI agents MUST infer user intent ONLY from natural language input
- Agents MUST map natural language to appropriate MCP tool calls
- No hardcoded command parsing or pattern matching
- Agent reasoning MUST be transparent and explainable
- Intent ambiguity MUST trigger clarification requests to user

**7. Specification Adherence**:
- Agents MUST use ONLY fields, endpoints, tools, and models defined in specifications
- Agents MUST NOT invent new API endpoints or database fields
- Agents MUST NOT assume tool capabilities beyond specification
- Unknown tool names or parameters MUST trigger validation errors
- All tool contracts MUST be documented in phase specifications

**8. User Communication Standards**:
- All successful actions MUST be confirmed with friendly natural language
- Responses MUST be conversational and context-aware
- Technical details MUST be abstracted unless explicitly requested
- Agent personality MUST remain consistent and helpful
- Multi-step operations MUST provide progress updates

**9. Error Handling Requirements**:
- Errors (task not found, invalid input, etc.) MUST be handled gracefully
- Error messages MUST be user-friendly and actionable
- System MUST NOT crash or expose stack traces to users
- Partial failures in multi-step operations MUST be reported clearly
- Recovery suggestions MUST be provided when possible

**10. Server Restart Resilience**:
- The system MUST continue working correctly after server restarts
- No critical state may be lost on restart
- Conversation history MUST survive restarts
- In-progress operations MUST be resumable or properly aborted
- Database integrity MUST be maintained across restart cycles

**Violation Policy**:
- Violating any of these rules is considered a **critical failure**
- Non-compliant code MUST NOT be merged
- Phase IV implementations MUST include automated tests for these constraints
- Regular architecture reviews MUST validate ongoing compliance

## Phase Scope Definitions

### Phase I: Foundation (Enhanced Console Application)

Core Todo operations with professional organization, automation, and discovery features.

**Core CRUD Operations**:
- Create, Read, Update, Delete tasks
- Single-user in-memory storage
- Menu-driven console interface using Rich library

**Task Organization Features**:
- **Priorities**: High, Medium, Low classification for task urgency
- **Categories**: Work, Home, Personal, Health, Finance, Other
- **Tags**: User-defined labels for flexible cross-category organization
- Backward compatibility: Existing tasks default to Medium priority, Other category

**Task Automation Features**:
- **Recurring Tasks**: Daily, weekly, monthly auto-rescheduling
- **Due Dates with Time**: Full datetime support (YYYY-MM-DD HH:MM)
- **Reminders**: Console notifications when due date approaches
- Auto-creation of next occurrence when recurring task completes

**Task Discovery Features**:
- **Search**: Keyword search across title, description, and tags
- **Filter**: By status, priority, category, tag, due date, overdue status
- **Sort**: By due date, priority, alphabetical order, creation date
- **Advanced Filter**: Combine multiple filter criteria

**User Interface Requirements**:
- Professional Rich-based console output with colors and formatting
- Clear menu structure with numbered options
- Informative feedback messages (success, error, info, warning)
- Task table display with all relevant columns
- Summary statistics panel

**Boundaries**:
- Console-based only (no GUI)
- In-memory storage only (no database persistence)
- Single-user operation
- No network functionality

### Phase II: Multi-User Web Application

Full-stack web application with authentication, database persistence, and multi-user support.

**Core Capabilities**:
- User registration and authentication (Better Auth)
- User-scoped todo lists (data isolation per user)
- Database persistence with Neon Serverless PostgreSQL
- RESTful API backend (Python/FastAPI)
- Modern web frontend (Next.js, React, TypeScript)
- Session management and secure authentication flows

**Technical Requirements**:
- SQLModel or equivalent ORM for database operations
- User authentication with signup/signin flows
- Authorization to ensure users only access their own data
- Database migrations for schema management
- API endpoints for all CRUD operations
- Frontend components for task management UI

**Boundaries**:
- Single-user sessions (no real-time collaboration yet)
- Standard CRUD operations (no AI features yet)
- Web deployment without containerization
- No event streaming or advanced orchestration

### Phase III: Real-Time Collaboration

- Real-time synchronization
- Multi-user collaboration on shared lists
- Docker containerization
- Kafka event streaming
- Kubernetes deployment readiness

### Phase IV: AI Enhancement (Chatbot Interface)

Full conversational AI interface for todo management using OpenAI Agents SDK and Model Context Protocol (MCP).

**Core Capabilities**:
- Natural language todo management via chat interface
- OpenAI Agents SDK integration for intent understanding
- MCP server implementation with stateless tool design
- Conversation persistence with database-backed history
- Multi-turn conversational flows with context retention

**Technical Requirements**:
- **Backend**: Stateless Python REST API with chat endpoints
- **AI Agent**: OpenAI Agents SDK with natural language processing
- **MCP Tools**: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- **Database**: Extended schema for conversations and message history
- **Chat API**: Fetch/store conversation history, return conversation_id + response + tool_calls
- **Architecture**: Fully stateless backend, all state in database

**AI Features**:
- Intelligent task suggestions based on context
- Natural language task creation ("Remind me to...")
- Smart categorization and prioritization from conversation
- Context-aware task queries ("What's on my list?")
- Multi-task operations in single conversation turn

**Architectural Constraints** (per Section VI):
- All task operations through MCP tools only
- No in-memory state or conversation caching
- Agent cannot directly access database
- Graceful error handling with user-friendly messages
- System resilience across server restarts

**Boundaries**:
- Single-user conversations (no multi-user chat collaboration yet)
- AI-powered CRUD operations only (no advanced workflow automation)
- No enterprise integrations or third-party AI services
- No Dapr runtime (deferred to Phase V)

### Phase V: Enterprise

- Analytics and reporting
- Third-party integrations
- Dapr runtime integration
- Advanced workflow automation
- Enterprise security features

## Governance

### Constitution Authority

This constitution is the supreme governing document for the Evolution of Todo project. All specifications, plans, tasks, and implementations MUST comply with principles defined herein.

### Amendment Procedure

1. Proposed amendment MUST be documented with rationale
2. Amendment MUST NOT contradict core SDD principles (Section I)
3. Amendment requires explicit approval before taking effect
4. All amendments MUST be versioned and dated
5. Dependent artifacts MUST be reviewed for compatibility after amendments

### Versioning Policy

- **MAJOR**: Backward-incompatible changes to core principles or removal of principles
- **MINOR**: New principles added or existing principles materially expanded
- **PATCH**: Clarifications, wording improvements, or non-semantic refinements

### Compliance Review

- All pull requests MUST verify compliance with this constitution
- Non-compliant code MUST NOT be merged
- Compliance exceptions MUST be documented in an ADR with explicit justification
- Regular audits SHOULD verify ongoing compliance

### Conflict Resolution

In case of conflict between artifacts:
1. This Constitution takes precedence over all other documents
2. Phase specifications take precedence over plans
3. Plans take precedence over task lists
4. Task lists take precedence over implementation details

**Version**: 1.3.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2026-01-02
