# UM-Squared: Campus Engagement Platform — Implementation Plan

> **Stack**: React SPA + Express.js + PostgreSQL + Prisma ORM
> **Repo**: `/home/nerd-rivera/Documents/um-squared`
> **Goal**: Social-media-like platform for UMass Amherst campus engagement. Student organizations post; students consume. Includes feeds, polls, events/RSVPs, dining, sports, messaging, and moderation.

---

## Technology Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Frontend | React + Vite | Largest ecosystem, TypeScript-first, existing `react` dependency |
| Backend | Express.js | Minimal, flexible, existing `express` dependency |
| Database | PostgreSQL | Relational data fits users/orgs/posts/RSVPs perfectly |
| ORM | Prisma | Type-safe, auto-generated client, excellent migrations |
| Auth | UMass CAS + email/password fallback | Students use existing credentials, fallback for guests |
| Media | Local `static/` via `multer` | Simplest start, migrate to S3 later |
| Real-time | Polling-based | Simpler than WebSockets, sufficient for notifications |
| Scheduling | `node-cron` | Lightweight cron for scheduled/recurring posts |
| Validation | `zod` | Runtime + TypeScript schema validation |
| Forms | `react-hook-form` | Performant form handling with Zod integration |

---

## EPIC 1: Project Foundation

**Goal**: Working development environment with database, ORM, and project structure.
**Team**: 1-2 people. **Foundation for all other epics.**

### Story 1.1: Backend scaffolding and dependencies

**Requirements**:
- Express.js server with TypeScript compilation
- All core dependencies installed and configured
- Environment variable management via `.env`

**Tasks**:
- [ ] **Task 1.1.1**: Install and configure backend dependencies
  - Express, Prisma, pg, bcryptjs, jsonwebtoken, multer, cors, dotenv, express-rate-limit, node-cron, zod, passport + passport-cas
  - Deliverable: `package.json` with all dependencies, server boots with `tsx watch`
- [ ] **Task 1.1.2**: Install and configure frontend dependencies
  - Vite, React 19, React Router DOM, Axios, date-fns, react-hook-form, @hookform/resolvers, zod
  - Deliverable: Vite dev server running, React app renders at `/client`
- [ ] **Task 1.1.3**: Create `.env` template and configure environment variables
  - `DATABASE_URL`, `JWT_SECRET`, `CAS_BASE_URL`, `CAS_SERVICE_URL`, `PORT`
  - Deliverable: `.env.example` file committed, `.env` in `.gitignore`

**Deliverable**: Both servers start locally; `GET /health` returns 200.

---

### Story 1.2: Database and Prisma setup

**Requirements**:
- PostgreSQL database accessible locally and in development
- Prisma schema with all models defined
- Migration system working

**Tasks**:
- [ ] **Task 1.2.1**: Initialize Prisma and connect to PostgreSQL
  - `npx prisma init`, configure `DATABASE_URL`
  - Deliverable: Prisma client generated, connection verified
- [ ] **Task 1.2.2**: Define Prisma schema — core models
  - Models: `User`, `Role`, `Organization`, `OrgApplication`, `Post`, `PostAttachment`, `Comment`, `Like`
  - Deliverable: `schema.prisma` with core models, types generated
- [ ] **Task 1.2.3**: Define Prisma schema — engagement models
  - Models: `Poll`, `PollOption`, `PollVote`, `Event`, `EventRSVP`, `Conversation`, `Message`, `Notification`
  - *Parallel with Task 1.2.2*
  - Deliverable: Complete schema with all engagement models
- [ ] **Task 1.2.4**: Define Prisma schema — content & moderation models
  - Models: `DiningMenu`, `SportsResult`, `ModerationFlag`, `ScheduledPost`
  - *Parallel with Task 1.2.2*
  - Deliverable: Complete schema with content and moderation models
- [ ] **Task 1.2.5**: Create and run initial migration
  - `npx prisma migrate dev --name init`
  - Deliverable: All tables created, Prisma migration history recorded

**Deliverable**: Complete database schema with migrations; Prisma Studio accessible at `npx prisma studio`.

---

### Story 1.3: Project structure and layered architecture

**Requirements**:
- Backend follows existing controller → service → repository → database pattern
- Frontend follows feature-based folder structure
- Shared types accessible to both layers

**Tasks**:
- [ ] **Task 1.3.1**: Restructure backend folders
  - `server/src/` with `controllers/`, `services/`, `repositories/`, `routes/`, `middleware/`, `models/`, `config/`, `utils/`
  - Replace dummy files with proper structure
  - Deliverable: Clean backend folder structure
- [ ] **Task 1.3.2**: Set up frontend folder structure
  - `client/src/` with `pages/`, `components/`, `hooks/`, `services/`, `types/`, `context/`, `utils/`
  - Deliverable: Clean frontend folder structure
- [ ] **Task 1.3.3**: Create shared type definitions
  - Move `Post.ts` and `Attachment.ts` to shared types; rewrite `Attachment` to use file metadata instead of DOM types
  - Deliverable: Shared types imported by both client and server

**Deliverable**: Both projects structured and ready for feature development. Can be worked on in parallel by frontend and backend developers.

---

## EPIC 2: Authentication and Authorization

**Goal**: Users can authenticate via UMass CAS or email/password; roles control access.
**Dependencies**: Epic 1 complete.
**Team**: 1-2 backend-focused. **Blocks all user-facing features.**

### Story 2.1: User registration and email authentication

**Requirements**:
- Users can sign up with email and password
- Passwords hashed with bcrypt
- Email verification required before account activation
- JWT access + refresh token pair issued on login

**Tasks**:
- [ ] **Task 2.1.1**: Implement user repository layer
  - CRUD operations for User model via Prisma
  - Deliverable: `UserRepository` class with all database methods
- [ ] **Task 2.1.2**: Implement auth service
  - Register, login, password hashing, JWT generation/verification, refresh token rotation
  - Deliverable: `AuthService` with all auth logic
- [ ] **Task 2.1.3**: Implement auth controllers and routes
  - `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
  - Deliverable: Working auth endpoints with request validation (Zod)
- [ ] **Task 2.1.4**: Implement auth middleware
  - `authenticateToken`, `requireRole(...roles)` middleware
  - Deliverable: Middleware protectable on any route

**Deliverable**: Full email/password auth flow; protected routes work correctly.

---

### Story 2.2: UMass CAS integration

**Requirements**:
- Users can log in via UMass CAS SSO
- CAS-authenticated users are auto-linked to existing accounts by email
- New CAS users are auto-verified (no email confirmation needed)

**Tasks**:
- [ ] **Task 2.2.1**: Configure Passport.js with CAS strategy
  - CAS server URL, service URL, callback handling
  - Deliverable: CAS strategy registered with Passport
- [ ] **Task 2.2.2**: Implement CAS login flow
  - `GET /auth/cas/login` → redirect to CAS
  - `GET /auth/cas/callback` → validate ticket, create/link user, issue JWT
  - Deliverable: Complete CAS login flow
- [ ] **Task 2.2.3**: Implement CAS logout
  - `GET /auth/cas/logout` → invalidate session, redirect to CAS logout
  - Deliverable: CAS logout working

**Deliverable**: CAS login fully functional; users can authenticate with UMass credentials.

---

### Story 2.3: Role management and permissions

**Requirements**:
- Four roles: `STUDENT`, `ORG_MEMBER`, `ORG_ADMIN`, `PLATFORM_ADMIN`
- Role-based access control on all routes
- Platform admin can assign roles

**Tasks**:
- [ ] **Task 2.3.1**: Implement role assignment service
  - Role changes, permission checks
  - Deliverable: `RoleService` with role management logic
- [ ] **Task 2.3.2**: Wire role middleware to all protected routes
  - Deliverable: All routes protected with appropriate role checks

**Deliverable**: Role system enforced across the application.

---

## EPIC 3: Organizations

**Goal**: Student organizations can apply, get approved, and manage their presence.
**Dependencies**: Epic 2 complete.
**Team**: 1 backend + 1 frontend (can work in parallel on backend API and frontend UI).

### Story 3.1: Organization creation and approval

**Requirements**:
- Users can apply to create an organization
- Applications include: name, description, category (Greek Life / RSO / Intramural Sports / Other), contact info
- Platform admins review and approve/reject applications
- Approved orgs get an organization profile

**Tasks**:
- [ ] **Task 3.1.1**: Implement org application repository and service
  - Create, list, approve, reject applications
  - Deliverable: `OrgApplicationService` with full CRUD
- [ ] **Task 3.1.2**: Implement org application API routes
  - `POST /orgs/apply`, `GET /orgs/applications` (admin), `PATCH /orgs/applications/:id/decision` (admin)
  - Deliverable: Working application endpoints
- [ ] **Task 3.1.3**: Build org application UI — *parallel with Tasks 3.1.1–3.1.2*
  - Application form with validation
  - Admin review queue with approve/reject buttons
  - Deliverable: Application submission and review UI

**Deliverable**: Complete org application flow from submission to approval.

---

### Story 3.2: Organization profiles

**Requirements**:
- Orgs have a public profile page
- Profile includes: name, bio, category, cover image, social links, member count, post count
- Org admins can edit their profile

**Tasks**:
- [ ] **Task 3.2.1**: Implement org repository and service
  - CRUD for Organization, member management
  - Deliverable: `OrganizationService`
- [ ] **Task 3.2.2**: Implement org API routes
  - `GET /orgs/:id`, `PATCH /orgs/:id`, `GET /orgs/:id/posts`, `GET /orgs/:id/events`
  - Deliverable: Working org endpoints
- [ ] **Task 3.2.3**: Build org profile UI — *parallel with Tasks 3.2.1–3.2.2*
  - Profile page with all fields, edit mode for admins
  - Deliverable: Org profile page at `/orgs/:id`

**Deliverable**: Full org profiles with public viewing and admin editing.

---

## EPIC 4: Posts and Feed

**Goal**: Organizations can create diverse posts; students can browse, interact, and filter.
**Dependencies**: Epics 2 + 3 complete.
**Team**: 2-3 people. Backend API and frontend UI can proceed in parallel.

### Story 4.1: Post creation with multiple types

**Requirements**:
- Post types: `TEXT`, `MEDIA` (images/video/audio), `LINK`, `POLL`, `EVENT`
- Media uploads via `multer` to local `static/uploads/` directory
- Posts are attributed to an organization
- Input validation with Zod schemas

**Tasks**:
- [ ] **Task 4.1.1**: Implement post repository layer
  - CRUD for Post, PostAttachment with Prisma
  - Deliverable: `PostRepository`
- [ ] **Task 4.1.2**: Implement media upload handling
  - Multer middleware, file validation (type, size limits), storage to `static/uploads/`
  - Deliverable: Upload middleware and service
- [ ] **Task 4.1.3**: Implement post service and API
  - `POST /posts`, `GET /posts/:id`, `PATCH /posts/:id`, `DELETE /posts/:id`
  - Attachment handling on create/update
  - Deliverable: Full post CRUD API
- [ ] **Task 4.1.4**: Build post composer UI — *parallel with Tasks 4.1.1–4.1.3*
  - Rich text editor, media upload, link embedding, post type selector
  - Deliverable: Post creation form

**Deliverable**: Orgs can create all post types with media attachments.

---

### Story 4.2: Polls

**Requirements**:
- Polls are a post type with configurable options
- Settings: single/multiple choice, one-time voting, allow vote change, hide results until voting ends
- Vote counts tracked per option
- Results visible based on settings

**Tasks**:
- [ ] **Task 4.2.1**: Implement poll repository and service
  - Poll creation, vote casting, vote changing, result retrieval
  - Enforce voting constraints (one vote, no change, etc.)
  - Deliverable: `PollService` with all poll logic
- [ ] **Task 4.2.2**: Implement poll API routes
  - `POST /polls/:id/vote`, `GET /polls/:id/results`, `PATCH /polls/:id/settings`
  - Deliverable: Poll interaction endpoints
- [ ] **Task 4.2.3**: Build poll UI — *parallel with Tasks 4.2.1–4.2.2*
  - Poll creation form with settings toggles
  - Poll display with voting interface and results visualization
  - Deliverable: Full poll experience

**Deliverable**: Complete poll system with all configurable options.

---

### Story 4.3: Events and RSVPs

**Requirements**:
- Events are a post type with date, time, location, capacity
- RSVP states: `GOING`, `MAYBE`, `WAITLISTED`
- Auto-waitlist when capacity is reached
- Auto-promote from waitlist when spots open
- Notification on RSVP confirmation from waitlist

**Tasks**:
- [ ] **Task 4.3.1**: Implement event repository and service
  - Event CRUD, RSVP management, waitlist logic, capacity checks
  - Deliverable: `EventService` with RSVP and waitlist logic
- [ ] **Task 4.3.2**: Implement event API routes
  - `POST /events/:id/rsvp`, `PATCH /events/:id/rsvp`, `GET /events/:id/rsvps`, `GET /events/:id/waitlist`
  - Deliverable: Event and RSVP endpoints
- [ ] **Task 4.3.3**: Build event UI — *parallel with Tasks 4.3.1–4.3.2*
  - Event creation form with date/time/location/capacity
  - RSVP buttons, waitlist indicator, attendee count
  - Deliverable: Full event experience

**Deliverable**: Complete event system with RSVPs and waitlisting.

---

### Story 4.4: Comments and Likes

**Requirements**:
- One-level-deep comments on posts
- Like/unlike on posts and comments
- Counts cached on parent for performance

**Tasks**:
- [ ] **Task 4.4.1**: Implement comment and like repository layer
  - Deliverable: `CommentRepository`, `LikeRepository`
- [ ] **Task 4.4.2**: Implement comment and like services
  - Create/delete comments, toggle likes, count caching
  - Deliverable: `CommentService`, `LikeService`
- [ ] **Task 4.4.3**: Implement API routes
  - `POST /posts/:id/comments`, `DELETE /comments/:id`, `POST /posts/:id/like`, `POST /comments/:id/like`
  - Deliverable: Interaction endpoints
- [ ] **Task 4.4.4**: Build interaction UI — *parallel with Tasks 4.4.1–4.4.3*
  - Comment section, like button with count, toggle state
  - Deliverable: Comments and likes on post detail view

**Deliverable**: Full post interaction system.

---

### Story 4.5: Home Feed (Personalized)

**Requirements**:
- Shows posts from organizations the student follows
- Mixed with trending posts for discovery
- Cursor-based pagination
- "Follow" relationship between users and organizations

**Tasks**:
- [ ] **Task 4.5.1**: Implement follow system
  - `UserFollow` model, follow/unfollow, followed orgs list
  - Deliverable: Follow service and API
- [ ] **Task 4.5.2**: Implement feed service
  - Query posts from followed orgs + trending, merge and sort by recency
  - Cursor pagination support
  - Deliverable: `FeedService` with personalized feed
- [ ] **Task 4.5.3**: Implement feed API
  - `GET /feed/home?cursor=&limit=`
  - Deliverable: Feed endpoint
- [ ] **Task 4.5.4**: Build feed UI — *parallel with Tasks 4.5.1–4.5.3*
  - Feed page with post cards, infinite scroll or load more
  - Deliverable: Home feed page

**Deliverable**: Personalized home feed with followed org posts.

---

### Story 4.6: Explore Feed with Filters

**Requirements**:
- Trending posts ranked by engagement + recency score
- Formula: `score = (likes * 2 + comments * 3) / POW(HOURS_SINCE_CREATED + 1, 1.5)`
- Category filters: Greek Life, RSO, Intramural Sports, All
- Events-only toggle
- Same pagination as home feed

**Tasks**:
- [ ] **Task 4.6.1**: Implement explore feed service
  - Trending score calculation, category filtering, events toggle
  - Deliverable: `ExploreService`
- [ ] **Task 4.6.2**: Implement explore API
  - `GET /feed/explore?category=&eventsOnly=&cursor=&limit=`
  - Deliverable: Explore endpoint
- [ ] **Task 4.6.3**: Build explore UI — *parallel with Tasks 4.6.1–4.6.2*
  - Filter toggles, events checkbox, feed display
  - Deliverable: Explore page with all filters

**Deliverable**: Fully filterable explore/trending feed.

---

## EPIC 5: Post Scheduling

**Goal**: Organizations can schedule posts for future publication, including recurring posts.
**Dependencies**: Epic 4 (Story 4.1) complete.
**Team**: 1 person. **Can proceed in parallel with Epics 6–8.**

### Story 5.1: Scheduled and recurring posts

**Requirements**:
- Orgs can set a future publish date/time for a post
- Recurring patterns: daily, weekly (specific day), monthly (specific date)
- Cron job checks for posts to publish every minute
- Published posts are copied from scheduled template

**Tasks**:
- [ ] **Task 5.1.1**: Implement scheduling service
  - Create scheduled post, recurring pattern storage, publish logic
  - Deliverable: `SchedulingService`
- [ ] **Task 5.1.2**: Set up cron job
  - `node-cron` to check and publish due posts
  - Deliverable: Cron job running on server start
- [ ] **Task 5.1.3**: Implement scheduling API
  - `POST /posts/schedule`, `GET /posts/scheduled`, `DELETE /posts/schedule/:id`
  - Deliverable: Scheduling endpoints
- [ ] **Task 5.1.4**: Build scheduling UI
  - Schedule picker, recurring pattern selector, scheduled posts list
  - Deliverable: Scheduling interface in post composer

**Deliverable**: Posts can be scheduled and recur automatically.

---

## EPIC 6: Communication and Notifications

**Goal**: Students can message organizations; users receive notifications for interactions.
**Dependencies**: Epic 2 complete.
**Team**: 1-2 people. **Can proceed in parallel with Epics 4–5.**

### Story 6.1: Direct messaging

**Requirements**:
- Students can message organizations (not student-to-student)
- Conversation threads with message history
- Unread message tracking
- Polling endpoint for new messages

**Tasks**:
- [ ] **Task 6.1.1**: Implement messaging repository and service
  - Conversation creation, message sending, unread tracking
  - Deliverable: `MessagingService`
- [ ] **Task 6.1.2**: Implement messaging API
  - `POST /conversations`, `GET /conversations`, `GET /conversations/:id/messages`, `POST /conversations/:id/messages`
  - `GET /messages/unread` for polling
  - Deliverable: Messaging endpoints
- [ ] **Task 6.1.3**: Build messaging UI — *parallel with Tasks 6.1.1–6.1.2*
  - Conversation list, message thread view, unread badges
  - Polling for new messages (30s interval)
  - Deliverable: Messaging interface

**Deliverable**: Full student-to-org messaging system.

---

### Story 6.2: Notifications

**Requirements**:
- In-app notifications for: RSVP confirmations, waitlist promotions, new messages, mentions, post likes/comments
- Polling endpoint for checking new notifications
- Notification preferences (optional, can be added later)

**Tasks**:
- [ ] **Task 6.2.1**: Implement notification service
  - Create notifications from various triggers, mark as read
  - Deliverable: `NotificationService`
- [ ] **Task 6.2.2**: Wire notification creation to triggers
  - Hook into RSVP, messaging, comment, like services
  - Deliverable: Notifications created on all trigger events
- [ ] **Task 6.2.3**: Implement notification API
  - `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
  - Deliverable: Notification endpoints
- [ ] **Task 6.2.4**: Build notification UI — *parallel with Tasks 6.2.1–6.2.3*
  - Notification bell with badge, dropdown list, mark as read
  - Deliverable: Notification center

**Deliverable**: Complete notification system with polling-based updates.

---

## EPIC 7: Dining and Sports

**Goal**: Dedicated tabs for UMass dining hall information and sports results.
**Dependencies**: Epic 1 complete.
**Team**: 1-2 people. **Fully independent — can start immediately after Epic 1.**

### Story 7.1: Dining tab

**Requirements**:
- Display dining hall locations, hours, and current menus
- Data sourced from UMass dining websites (scraping or API)
- Scheduled data refresh (daily or multiple times per day)

**Tasks**:
- [ ] **Task 7.1.1**: Research and implement UMass dining data source
  - Identify API endpoints or scraping targets
  - Deliverable: Data fetching module
- [ ] **Task 7.1.2**: Implement dining service and storage
  - Store fetched data in `DiningMenu` model
  - Scheduled refresh via `node-cron`
  - Deliverable: `DiningService` with data pipeline
- [ ] **Task 7.1.3**: Implement dining API
  - `GET /dining/halls`, `GET /dining/halls/:id/menu`
  - Deliverable: Dining endpoints
- [ ] **Task 7.1.4**: Build dining UI — *parallel with Tasks 7.1.1–7.1.3*
  - Dining hall cards, menu display, hours, location info
  - Deliverable: Dining tab page

**Deliverable**: Functional dining information tab with live data.

---

### Story 7.2: Sports tab

**Requirements**:
- Display UMass Athletics results, schedules, and standings
- Data sourced from UMass Athletics website
- Scheduled data refresh (daily or after game days)

**Tasks**:
- [ ] **Task 7.2.1**: Research and implement UMass sports data source — *parallel with Story 7.1*
  - Identify API endpoints or scraping targets
  - Deliverable: Data fetching module
- [ ] **Task 7.2.2**: Implement sports service and storage
  - Store fetched data in `SportsResult` model
  - Scheduled refresh via `node-cron`
  - Deliverable: `SportsService` with data pipeline
- [ ] **Task 7.2.3**: Implement sports API — *parallel with Tasks 7.2.1–7.2.2*
  - `GET /sports/results`, `GET /sports/schedule`, `GET /sports/standings`
  - Deliverable: Sports endpoints
- [ ] **Task 7.2.4**: Build sports UI — *parallel with Tasks 7.2.1–7.2.3*
  - Score cards, schedule view, standings table
  - Deliverable: Sports tab page

**Deliverable**: Functional sports information tab with live data.

---

## EPIC 8: Content Moderation

**Goal**: Automated and manual content moderation to maintain platform quality.
**Dependencies**: Epic 4 (Story 4.1) complete.
**Team**: 1 person. **Can proceed in parallel with Epics 5–7.**

### Story 8.1: Automated content filtering

**Requirements**:
- Keyword-based flagging on post creation
- Configurable keyword list (stored in config/database)
- Flagged posts routed to moderation queue instead of publishing

**Tasks**:
- [ ] **Task 8.1.1**: Implement moderation service
  - Keyword scanning, flag creation, post routing logic
  - Deliverable: `ModerationService`
- [ ] **Task 8.1.2**: Wire moderation into post creation flow
  - Hook into post service; flagged posts get `PENDING` status
  - Deliverable: Moderation integrated into post creation

**Deliverable**: Automated content filtering on all new posts.

---

### Story 8.2: Moderation dashboard

**Requirements**:
- Admin dashboard for reviewing flagged content
- Approve (publish) or reject (delete + notify org) actions
- Reason for rejection recorded

**Tasks**:
- [ ] **Task 8.2.1**: Implement moderation queue API
  - `GET /moderation/queue`, `PATCH /moderation/:id/decision`
  - Deliverable: Moderation endpoints
- [ ] **Task 8.2.2**: Build moderation dashboard UI
  - Queue view, approve/reject with reason, post preview
  - Deliverable: Admin moderation page

**Deliverable**: Complete moderation workflow from flag to resolution.

---

## EPIC 9: Frontend Application Shell

**Goal**: Complete React SPA with routing, layout, navigation, and state management.
**Dependencies**: Epic 1 complete. **Stories can progress in parallel as backend APIs become available.**
**Team**: 1-2 frontend developers.

### Story 9.1: App shell and routing

**Requirements**:
- React Router with all page routes
- Layout with navigation bar (Home, Explore, Dining, Sports, Messages, Profile)
- Protected routes for authenticated-only pages
- Responsive design (mobile-first)

**Tasks**:
- [ ] **Task 9.1.1**: Set up React Router and page structure
  - Routes for all pages, 404 handler
  - Deliverable: Router configuration
- [ ] **Task 9.1.2**: Build layout components
  - Navbar, sidebar (optional), tab navigation, responsive breakpoints
  - Deliverable: Layout shell components
- [ ] **Task 9.1.3**: Implement auth context and protected routes
  - Auth context with user state, JWT management, login redirect
  - Deliverable: Auth context and route guards

**Deliverable**: Navigable app shell with auth protection.

---

### Story 9.2: State management and API layer

**Requirements**:
- Centralized API client with Axios
- React Query or SWR for server state management
- Auth token refresh handling

**Tasks**:
- [ ] **Task 9.2.1**: Set up API client
  - Axios instance with base URL, interceptors for auth tokens
  - Deliverable: API client module
- [ ] **Task 9.2.2**: Set up React Query
  - Query client, cache configuration, mutation handlers
  - Deliverable: React Query integration
- [ ] **Task 9.2.3**: Create API hooks for all endpoints
  - One hook per API endpoint following React Query patterns
  - Deliverable: Complete hook library

**Deliverable**: Robust data fetching layer for all frontend components.

---

### Story 9.3: Admin dashboard

**Requirements**:
- Dashboard for platform admins
- Sections: org applications, moderation queue, user management, platform stats

**Tasks**:
- [ ] **Task 9.3.1**: Build admin dashboard layout
  - Admin-only route, dashboard navigation
  - Deliverable: Admin shell
- [ ] **Task 9.3.2**: Build admin panels
  - Org application review, moderation queue, user list with role assignment
  - Deliverable: Complete admin dashboard

**Deliverable**: Full admin dashboard for platform management.

---

## Parallel Execution Map

The following epics can be worked on simultaneously:

| Wave | Epics | Team Size |
|------|-------|-----------|
| **Wave 1** | Epic 1 (Foundation) | 1-2 people — **everyone depends on this** |
| **Wave 2** | Epic 2 (Auth) | 1-2 people — **blocks most features** |
| **Wave 3** | Epic 7 (Dining/Sports) — independent of Epic 2 | 1 person |
| **Wave 3** | Epic 9.1–9.2 (Frontend shell) — independent of Epic 2 | 1-2 people |
| **Wave 4** | Epic 3 (Organizations) — after Epic 2 | 1-2 people |
| **Wave 4** | Epic 4 (Posts/Feed) — after Epics 2+3 | 2-3 people |
| **Wave 5** | Epic 5 (Scheduling) — after Epic 4.1 | 1 person |
| **Wave 5** | Epic 6 (Messaging) — after Epic 2 | 1-2 people |
| **Wave 5** | Epic 8 (Moderation) — after Epic 4.1 | 1 person |
| **Wave 6** | Epic 9.3 (Admin dashboard) — after Epics 3+8 | 1 person |

---

## Verification Checklist

### Database and ORM
- [ ] `npx prisma migrate dev` creates all tables
- [ ] `npx prisma studio` shows all models with correct relations
- [ ] Prisma client types are generated and importable

### Authentication
- [ ] Register via email/password → JWT issued → protected route accessible
- [ ] Login via CAS → user created/linked → JWT issued
- [ ] Token refresh works; expired tokens are rejected
- [ ] Role middleware blocks unauthorized access

### Organizations
- [ ] Org application submitted → appears in admin queue → approved → profile created
- [ ] Org profile displays all fields; editable by org admin only

### Posts
- [ ] All post types creatable: text, media, link, poll, event
- [ ] Media uploads stored in `static/uploads/` and retrievable
- [ ] Polls enforce voting constraints correctly
- [ ] Events enforce capacity; waitlist promotes on spot opening

### Feed
- [ ] Home feed shows followed org posts
- [ ] Explore feed shows trending posts with correct scoring
- [ ] Category filters (Greek/RSO/Intramural/All) work correctly
- [ ] Events-only toggle filters correctly

### Interactions
- [ ] Comments create/delete correctly; one-level nesting enforced
- [ ] Likes toggle correctly; counts update

### Communication
- [ ] Messages send between student and org; threads persist
- [ ] Unread count updates on new messages
- [ ] Notifications fire on RSVP, message, comment, like events

### Scheduling
- [ ] Scheduled post publishes at correct time
- [ ] Recurring posts create new instances on schedule

### Dining/Sports
- [ ] Dining data fetches and displays correctly
- [ ] Sports data fetches and displays correctly
- [ ] Scheduled refresh updates data automatically

### Moderation
- [ ] Posts with flagged keywords land in moderation queue
- [ ] Admin can approve (publishes) or reject (deletes + notifies)

### Frontend
- [ ] All pages navigable; responsive on mobile and desktop
- [ ] Auth state persists across page reloads
- [ ] API errors handled gracefully with user feedback

---

## Out of Scope (v2 Considerations)

- Full-text search across posts and organizations
- Student-to-student messaging
- Push notifications (browser or mobile)
- Mobile native app (React Native/Flutter)
- Cloud media storage migration (S3)
- Advanced analytics dashboard
- Multi-campus support
- Internationalization (i18n)
