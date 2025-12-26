# Technical Product Requirements Document (PRD)
# QuizMaker Application

## Document Information
- **Version:** 1.0
- **Last Updated:** December 18, 2025
- **Status:** Active Development

---

## 1. Executive Summary

### Product Vision
QuizMaker is a comprehensive quiz-based application designed to facilitate online learning and assessment. The platform supports two primary user types: **Students** and **Instructors**, enabling instructors to create, manage, and distribute quizzes while students can take quizzes and track their progress.

### Goals
- Provide a simple, intuitive interface for quiz creation and taking
- Enable instructors to create quizzes aligned with educational standards
- Allow students to take quizzes and receive immediate feedback
- Support both students and instructors with role-appropriate dashboards
- Implement secure, simple authentication without complex session management

### Success Metrics
- User registration and login success rate > 95%
- Quiz creation time < 5 minutes for standard quizzes
- Quiz taking experience with < 1 second response time
- Platform uptime > 99.5%

---

## 2. Architecture Overview

### Technology Stack

#### Frontend
- **Framework:** Next.js 15.5.9 with App Router
- **UI Library:** shadcn/ui with Radix UI primitives
- **Styling:** Tailwind CSS 4
- **State Management:** React Server Components + URL-based state
- **Forms:** React Hook Form + Zod validation

#### Backend
- **Runtime:** Cloudflare Workers (Node.js compatibility)
- **Database:** Cloudflare D1 (SQLite)
- **Authentication:** Cookie-based token authentication
- **API Pattern:** Next.js Server Actions

#### Deployment
- **Platform:** Cloudflare Workers
- **Build Tool:** OpenNext.js for Cloudflare
- **Database Binding:** `quizmakerDatabase`

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                     (Next.js App Router)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Workers Edge                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Server Components                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │  │
│  │  │   Auth     │  │   Quizzes  │  │   Results    │   │  │
│  │  │  Actions   │  │  Actions   │  │   Actions    │   │  │
│  │  └────────────┘  └────────────┘  └──────────────┘   │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │              Service Layer (lib/services)             │  │
│  │  - User Service    - Quiz Service    - Auth Service  │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │              D1 Client (lib/d1-client.ts)            │  │
│  │         - Query Normalization                        │  │
│  │         - Parameter Binding                          │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare D1 Database (SQLite)                 │
│  - users        - quizzes       - questions                  │
│  - quiz_attempts - answers      - quiz_results               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK(user_type IN ('student', 'instructor')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
```

### Quizzes Table
```sql
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id TEXT NOT NULL,
  duration_minutes INTEGER,
  passing_score INTEGER,
  is_published INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_quizzes_instructor ON quizzes(instructor_id);
CREATE INDEX idx_quizzes_published ON quizzes(is_published);
```

### Questions Table
```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK(question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);
```

### Answer Options Table
```sql
CREATE TABLE answer_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_answer_options_question ON answer_options(question_id);
```

### Quiz Attempts Table
```sql
CREATE TABLE quiz_attempts (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  score INTEGER,
  total_points INTEGER,
  status TEXT NOT NULL CHECK(status IN ('in_progress', 'completed', 'abandoned')),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
```

### Student Answers Table
```sql
CREATE TABLE student_answers (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_option_id TEXT,
  answer_text TEXT,
  is_correct INTEGER,
  points_earned INTEGER DEFAULT 0,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_option_id) REFERENCES answer_options(id) ON DELETE SET NULL
);

CREATE INDEX idx_student_answers_attempt ON student_answers(attempt_id);
```

---

## 4. Authentication System

### Authentication Flow

#### Registration Flow
1. User submits registration form with email, password, full name, and user type
2. System validates email format and password strength (min 8 characters)
3. System checks if email already exists
4. Password is hashed using bcrypt (10 rounds)
5. User record is created in database
6. Authentication token is generated
7. Token is stored in HTTP-only cookie
8. User is redirected to dashboard

#### Login Flow
1. User submits login form with email and password
2. System retrieves user by email
3. Password is verified against stored hash
4. If valid, authentication token is generated
5. Token is stored in HTTP-only cookie
6. User is redirected to dashboard

### Token Structure
- **Type:** JWT-style signed token
- **Content:** User ID and user type
- **Storage:** HTTP-only cookie named `auth-token`
- **Expiration:** 7 days
- **Security:** Signed with secret key

### Password Security
- **Hashing Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Minimum Length:** 8 characters
- **Storage:** Never store plain text passwords

---

## 5. User Roles and Permissions

### Student Role
**Capabilities:**
- View available quizzes
- Take quizzes
- View quiz results and history
- Track progress over time
- View leaderboards (future)

**Dashboard Features:**
- Recent quiz attempts
- Available quizzes
- Performance statistics
- Upcoming assignments (future)

### Instructor Role
**Capabilities:**
- Create new quizzes
- Edit existing quizzes
- Add/remove questions
- Publish/unpublish quizzes
- View student results
- Export quiz data (future)
- Generate reports (future)

**Dashboard Features:**
- Quiz management interface
- Student performance analytics
- Recent quiz creation activity
- Quick actions (create quiz, view results)

---

## 6. Core Features

### 6.1 User Management

#### Registration
- **Endpoint:** Server Action in `/app/actions/auth.ts`
- **Validation:** Email format, password strength, unique email
- **Fields:** Email, Password, Full Name, User Type
- **Error Handling:** Display user-friendly error messages

#### Login
- **Endpoint:** Server Action in `/app/actions/auth.ts`
- **Validation:** Email and password required
- **Session:** Create auth cookie on success
- **Redirect:** Dashboard after successful login

#### Logout
- **Endpoint:** Server Action in `/app/actions/auth.ts`
- **Action:** Clear auth cookie
- **Redirect:** Login page

### 6.2 Dashboard

#### Student Dashboard
- **Welcome Section:** Personalized greeting
- **Available Quizzes:** List of published quizzes
- **Recent Attempts:** History of quiz attempts with scores
- **Statistics:** Overall performance metrics

#### Instructor Dashboard
- **Welcome Section:** Personalized greeting
- **Quiz Management:** List of created quizzes with edit/delete
- **Quick Actions:** Create new quiz, view all results
- **Statistics:** Total quizzes, total students, average scores

### 6.3 Quiz Management (Instructor)

#### Create Quiz
- **Form Fields:** Title, Description, Duration, Passing Score
- **Add Questions:** Question text, type, points, answer options
- **Question Types:** Multiple Choice, True/False, Short Answer
- **Save Draft:** Save unpublished quiz
- **Publish:** Make quiz available to students

#### Edit Quiz
- **Modify Details:** Update quiz information
- **Edit Questions:** Add, remove, or modify questions
- **Reorder Questions:** Drag and drop interface (future)
- **Unpublish:** Remove quiz from student view

### 6.4 Quiz Taking (Student)

#### Start Quiz
- **View Details:** Quiz title, description, duration, passing score
- **Start Attempt:** Create new quiz attempt record
- **Timer:** Display countdown if duration is set
- **Auto-Save:** Save progress periodically (future)

#### Submit Quiz
- **Calculate Score:** Evaluate answers automatically
- **Store Results:** Save attempt with score
- **Display Results:** Show score, correct answers, feedback
- **Review:** Allow students to review their answers

---

## 7. API Design

### Server Actions

All API interactions use Next.js Server Actions for better security and type safety.

#### Authentication Actions
```typescript
// app/actions/auth.ts

export async function register(formData: {
  email: string;
  password: string;
  fullName: string;
  userType: 'student' | 'instructor';
}): Promise<{ success: boolean; error?: string }>;

export async function login(formData: {
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }>;

export async function logout(): Promise<void>;

export async function getCurrentUser(): Promise<User | null>;
```

#### Quiz Actions
```typescript
// app/actions/quiz.ts

export async function createQuiz(data: QuizData): Promise<{ id: string }>;

export async function getQuizzesByInstructor(instructorId: string): Promise<Quiz[]>;

export async function getPublishedQuizzes(): Promise<Quiz[]>;

export async function publishQuiz(quizId: string): Promise<void>;

export async function deleteQuiz(quizId: string): Promise<void>;
```

#### Quiz Attempt Actions
```typescript
// app/actions/quiz-attempt.ts

export async function startQuizAttempt(quizId: string): Promise<{ attemptId: string }>;

export async function submitQuizAttempt(attemptId: string, answers: Answer[]): Promise<{
  score: number;
  totalPoints: number;
  passed: boolean;
}>;

export async function getStudentAttempts(studentId: string): Promise<QuizAttempt[]>;
```

---

## 8. UI/UX Design

### Design Principles
- **Simplicity:** Clean, minimal interface
- **Consistency:** Use shadcn/ui components throughout
- **Responsiveness:** Mobile-first design
- **Accessibility:** WCAG 2.1 Level AA compliance
- **Performance:** Fast page loads, optimistic UI updates

### Color Scheme
- **Primary:** Tailwind Blue (blue-600)
- **Success:** Tailwind Green (green-600)
- **Error:** Tailwind Red (red-600)
- **Warning:** Tailwind Yellow (yellow-600)
- **Neutral:** Tailwind Gray (gray-600)

### Component Library
- **UI Framework:** shadcn/ui
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Forms:** React Hook Form + Zod

### Page Layouts

#### Login/Registration Pages
- Centered card layout
- Logo/branding at top
- Form in the middle
- Link to alternate page at bottom
- Responsive design (full width on mobile)

#### Dashboard Layout
- Header with navigation and logout
- Sidebar for navigation (collapsible on mobile)
- Main content area
- Footer with links

---

## 9. Security Considerations

### Authentication Security
- Passwords hashed with bcrypt
- HTTP-only cookies prevent XSS attacks
- No sensitive data in JWT payload
- Token expiration (7 days)
- Secure flag on cookies in production

### Input Validation
- Server-side validation for all inputs
- Zod schemas for type safety
- SQL injection prevention via prepared statements
- XSS prevention via React's built-in escaping

### Authorization
- Check user authentication on all protected routes
- Verify ownership before allowing edits
- Students can only view published quizzes
- Instructors can only edit their own quizzes

### Data Privacy
- No sharing of student data without consent
- Instructors can only see results for their quizzes
- Secure password reset flow (future)
- GDPR-compliant data handling (future)

---

## 10. Performance Optimization

### Frontend Performance
- Server Components by default
- Client Components only when needed
- Code splitting with Next.js
- Image optimization with Next.js Image
- Lazy loading for non-critical components

### Database Performance
- Indexes on frequently queried columns
- Prepared statements cached by D1
- Efficient query design (avoid N+1)
- Pagination for large result sets

### Edge Performance
- Deploy to Cloudflare Workers (global edge)
- Static asset caching
- Database queries at the edge
- < 50ms cold start time

---

## 11. Error Handling

### Client-Side Errors
- Form validation errors displayed inline
- Toast notifications for async operations
- Friendly error messages (no technical jargon)
- Retry mechanisms for network errors

### Server-Side Errors
- Structured error responses
- Error logging to Cloudflare observability
- Graceful degradation
- User-friendly error pages (404, 500)

### Database Errors
- Connection error handling
- Transaction rollback on failures
- Unique constraint violations handled gracefully
- Foreign key violations prevented

---

## 12. Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Authentication helpers
- Data validation schemas

### Integration Tests
- Server Actions
- Database operations
- Authentication flows
- Quiz submission logic

### E2E Tests (Future)
- Complete user journeys
- Registration to quiz completion
- Instructor quiz creation flow
- Cross-browser testing

---

## 13. Deployment Strategy

### Local Development
- Next.js dev server with Turbopack
- Local D1 database binding
- Hot module replacement
- Environment variables in `.dev.vars`

### Preview Deployments
- Cloudflare Workers preview
- Temporary URL for testing
- Production-like environment

### Production Deployment
- Cloudflare Workers global network
- D1 database replication
- Zero-downtime deployments
- Automatic rollback on failures

### Deployment Commands
```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# Preview before deploy
npm run preview
```

---

## 14. Monitoring and Analytics

### Application Monitoring
- Cloudflare Workers observability
- Request logging
- Error tracking
- Performance metrics

### User Analytics (Future)
- Quiz completion rates
- Average scores
- Time spent on quizzes
- Popular quiz topics

### Database Monitoring
- Query performance
- Connection pool usage
- Storage utilization
- Slow query identification

---

## 15. Future Enhancements

### Phase 2 Features
- Quiz scheduling and deadlines
- Quiz categories and tags
- Student progress tracking
- Instructor analytics dashboard
- Export quiz results to CSV

### Phase 3 Features
- Quiz templates
- Question bank/library
- Collaborative quiz creation
- Quiz sharing between instructors
- Mobile app (React Native)

### Phase 4 Features
- Advanced question types (essay, file upload)
- Peer review system
- Gamification (badges, achievements)
- Integration with LMS (Canvas, Moodle)
- AI-powered quiz generation

---

## 16. Dependencies

### Production Dependencies
- `next` - React framework
- `react` - UI library
- `react-dom` - React rendering
- `@opennextjs/cloudflare` - Cloudflare Workers adapter
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icon library
- `sonner` - Toast notifications
- `tailwind-merge` - Tailwind class merging
- `class-variance-authority` - Component variants
- `clsx` - Class name utility

### Development Dependencies
- `typescript` - Type safety
- `eslint` - Code linting
- `tailwindcss` - CSS framework
- `wrangler` - Cloudflare CLI
- `@types/*` - Type definitions

### External Services
- Cloudflare Workers (compute)
- Cloudflare D1 (database)
- Cloudflare Images (image optimization)

---

## 17. Risks and Mitigations

### Risk: Database Migration Failures
- **Mitigation:** Test migrations locally first
- **Mitigation:** Backup database before migrations
- **Mitigation:** Incremental migrations, not big-bang

### Risk: Authentication Security Breach
- **Mitigation:** Use industry-standard bcrypt
- **Mitigation:** HTTP-only cookies
- **Mitigation:** Regular security audits

### Risk: Poor Performance at Scale
- **Mitigation:** Database indexing
- **Mitigation:** Edge deployment
- **Mitigation:** Caching strategies
- **Mitigation:** Load testing before launch

### Risk: User Data Loss
- **Mitigation:** D1 automatic backups
- **Mitigation:** Transaction-based operations
- **Mitigation:** Soft deletes for critical data

---

## 18. Success Criteria

### MVP Launch Criteria
- ✅ User registration and login working
- ✅ Students can view and take quizzes
- ✅ Instructors can create and manage quizzes
- ✅ Quiz results are calculated and stored
- ✅ Dashboard shows relevant data for each role
- ✅ Application deployed to Cloudflare Workers
- ✅ No critical security vulnerabilities

### Post-MVP Success Metrics
- 100+ registered users in first month
- 500+ quiz attempts in first month
- < 2% error rate
- > 90% user satisfaction score
- < 1s average page load time

---

## 19. Implementation Phases

### Phase 0: Foundation ✅ COMPLETED
**Status:** ✅ Completed
**Completion Date:** December 26, 2025

**Completed Items:**
- ✅ Database schema design and migrations
- ✅ D1 client setup with query normalization
- ✅ Authentication system (registration, login, logout)
- ✅ User service layer
- ✅ Auth service with token management
- ✅ Login and registration pages
- ✅ Cookie-based authentication
- ✅ Password hashing with bcrypt
- ✅ Form validation with Zod

---

### Phase 1: Quiz Management (Instructor Features)
**Status:** 🔄 In Progress
**Estimated Duration:** 4-5 days
**Goal:** Enable instructors to create, edit, and manage quizzes

#### Phase 1A: Quiz Creation
**Estimated Duration:** 2 days

**Backend Tasks:**
- [ ] Create quiz service (`lib/services/quiz.service.ts`)
  - [ ] `createQuiz(instructorId, quizData)` - Create new quiz
  - [ ] `getQuizById(quizId, userId?)` - Retrieve quiz details
  - [ ] `getQuizzesByInstructor(instructorId)` - List instructor's quizzes
  - [ ] `updateQuiz(quizId, instructorId, quizData)` - Update quiz details
  - [ ] `deleteQuiz(quizId, instructorId)` - Soft/hard delete quiz
  - [ ] `publishQuiz(quizId, instructorId)` - Make quiz available to students
  - [ ] `unpublishQuiz(quizId, instructorId)` - Hide quiz from students

- [ ] Create question service (`lib/services/question.service.ts`)
  - [ ] `createQuestion(quizId, questionData)` - Add question to quiz
  - [ ] `getQuestionsByQuiz(quizId)` - Retrieve all questions for a quiz
  - [ ] `updateQuestion(questionId, questionData)` - Update question
  - [ ] `deleteQuestion(questionId)` - Remove question from quiz
  - [ ] `reorderQuestions(quizId, questionIds)` - Update question order
  - [ ] `createAnswerOption(questionId, optionData)` - Add answer option
  - [ ] `updateAnswerOption(optionId, optionData)` - Update answer option
  - [ ] `deleteAnswerOption(optionId)` - Remove answer option

- [ ] Create Server Actions (`app/actions/quiz.ts`)
  - [ ] `createQuizAction(formData)` - Quiz creation action
  - [ ] `updateQuizAction(quizId, formData)` - Quiz update action
  - [ ] `deleteQuizAction(quizId)` - Quiz deletion action
  - [ ] `publishQuizAction(quizId)` - Publish quiz action
  - [ ] `getInstructorQuizzesAction()` - Get instructor's quizzes

**Frontend Tasks:**
- [ ] Create instructor dashboard page (`app/instructor/page.tsx`)
  - [ ] Welcome section with instructor name
  - [ ] Quick stats (total quizzes, published, drafts)
  - [ ] Quiz list with status badges
  - [ ] Create quiz button

- [ ] Create quiz creation page (`app/instructor/quiz/new/page.tsx`)
  - [ ] Quiz details form (title, description, duration, passing score)
  - [ ] Form validation with Zod
  - [ ] Save as draft functionality
  - [ ] Navigation to add questions

- [ ] Create quiz list component (`components/instructor/quiz-list.tsx`)
  - [ ] Display quizzes in table/card view
  - [ ] Status indicators (draft, published)
  - [ ] Quick actions (edit, delete, publish/unpublish)
  - [ ] Empty state for no quizzes

**Validation & Schema:**
- [ ] Quiz validation schema (`lib/schemas/quiz.schema.ts`)
- [ ] Question validation schema (`lib/schemas/question.schema.ts`)

---

#### Phase 1B: Question Management
**Estimated Duration:** 2-3 days

**Frontend Tasks:**
- [ ] Create question builder page (`app/instructor/quiz/[id]/questions/page.tsx`)
  - [ ] Question list view with reordering
  - [ ] Add question button
  - [ ] Question type selector (multiple choice, true/false, short answer)
  - [ ] Question form with real-time preview

- [ ] Create question editor component (`components/instructor/question-editor.tsx`)
  - [ ] Question text input
  - [ ] Points allocation
  - [ ] Answer options management
  - [ ] Mark correct answer
  - [ ] Add/remove answer options

- [ ] Create question type components
  - [ ] Multiple choice editor (`components/instructor/multiple-choice-editor.tsx`)
  - [ ] True/False editor (`components/instructor/true-false-editor.tsx`)
  - [ ] Short answer editor (`components/instructor/short-answer-editor.tsx`)

- [ ] Create quiz preview component (`components/instructor/quiz-preview.tsx`)
  - [ ] Preview quiz as students would see it
  - [ ] Navigate through questions
  - [ ] View without submitting

**Backend Tasks:**
- [ ] Server Actions for questions (`app/actions/question.ts`)
  - [ ] `createQuestionAction(quizId, questionData)`
  - [ ] `updateQuestionAction(questionId, questionData)`
  - [ ] `deleteQuestionAction(questionId)`
  - [ ] `reorderQuestionsAction(quizId, questionIds)`

**Testing:**
- [ ] Unit tests for quiz service
- [ ] Unit tests for question service
- [ ] Integration tests for quiz creation flow

---

### Phase 2: Quiz Taking (Student Features)
**Status:** ⏳ Pending
**Estimated Duration:** 3-4 days
**Goal:** Enable students to browse, take, and complete quizzes

#### Phase 2A: Quiz Discovery & Start
**Estimated Duration:** 1 day

**Backend Tasks:**
- [ ] Create quiz discovery service methods
  - [ ] `getPublishedQuizzes()` - Get all published quizzes
  - [ ] `getQuizWithQuestions(quizId)` - Get full quiz data for taking
  - [ ] `getQuizPreview(quizId)` - Get quiz metadata without answers

- [ ] Create quiz attempt service (`lib/services/quiz-attempt.service.ts`)
  - [ ] `startQuizAttempt(studentId, quizId)` - Create new attempt
  - [ ] `getAttemptById(attemptId)` - Retrieve attempt details
  - [ ] `getStudentAttempts(studentId)` - Get student's attempt history
  - [ ] `getAttemptsByQuiz(quizId)` - Get all attempts for a quiz (instructor)

**Frontend Tasks:**
- [ ] Create student dashboard page (`app/student/page.tsx`)
  - [ ] Welcome section with student name
  - [ ] Available quizzes list
  - [ ] Recent attempts with scores
  - [ ] Quick stats (quizzes taken, average score)

- [ ] Create quiz list component (`components/student/quiz-list.tsx`)
  - [ ] Display published quizzes
  - [ ] Quiz metadata (title, description, duration, passing score)
  - [ ] Start quiz button
  - [ ] Number of questions indicator

- [ ] Create quiz detail page (`app/student/quiz/[id]/page.tsx`)
  - [ ] Quiz information display
  - [ ] Start quiz button
  - [ ] Previous attempts section
  - [ ] Time limit warning if applicable

**Server Actions:**
- [ ] `getPublishedQuizzesAction()` - Get available quizzes
- [ ] `startQuizAttemptAction(quizId)` - Start new attempt

---

#### Phase 2B: Quiz Taking Interface
**Estimated Duration:** 2 days

**Frontend Tasks:**
- [ ] Create quiz taking page (`app/student/quiz/[id]/take/page.tsx`)
  - [ ] Question navigation (previous/next)
  - [ ] Progress indicator
  - [ ] Timer display (if quiz has time limit)
  - [ ] Auto-save functionality
  - [ ] Submit quiz confirmation dialog

- [ ] Create question display components
  - [ ] Multiple choice question (`components/student/multiple-choice-question.tsx`)
  - [ ] True/False question (`components/student/true-false-question.tsx`)
  - [ ] Short answer question (`components/student/short-answer-question.tsx`)

- [ ] Create quiz navigation component (`components/student/quiz-navigation.tsx`)
  - [ ] Question number indicators
  - [ ] Answered/unanswered status
  - [ ] Jump to question functionality
  - [ ] Submit button

**Backend Tasks:**
- [ ] Update quiz attempt service
  - [ ] `saveAnswer(attemptId, questionId, answer)` - Save single answer
  - [ ] `saveAnswers(attemptId, answers)` - Batch save answers
  - [ ] `submitQuizAttempt(attemptId)` - Complete and grade attempt

**Server Actions:**
- [ ] `saveAnswerAction(attemptId, questionId, answer)` - Save answer
- [ ] `submitQuizAction(attemptId, answers)` - Submit quiz

---

#### Phase 2C: Quiz Results & Review
**Estimated Duration:** 1 day

**Backend Tasks:**
- [ ] Create grading service (`lib/services/grading.service.ts`)
  - [ ] `gradeMultipleChoice(answer, correctOptionId)` - Grade MC question
  - [ ] `gradeTrueFalse(answer, correctAnswer)` - Grade T/F question
  - [ ] `calculateQuizScore(attemptId)` - Calculate total score
  - [ ] `getAttemptResults(attemptId)` - Get detailed results

**Frontend Tasks:**
- [ ] Create results page (`app/student/quiz/[id]/results/[attemptId]/page.tsx`)
  - [ ] Score display (points earned / total points)
  - [ ] Pass/fail indicator
  - [ ] Percentage score
  - [ ] Time taken display
  - [ ] Review answers button

- [ ] Create quiz review page (`app/student/quiz/[id]/review/[attemptId]/page.tsx`)
  - [ ] Display all questions with student's answers
  - [ ] Show correct answers
  - [ ] Indicate correct/incorrect
  - [ ] Explanation section (future)

- [ ] Create results summary component (`components/student/results-summary.tsx`)
  - [ ] Score breakdown by question
  - [ ] Visual indicators (checkmarks, X's)
  - [ ] Performance chart (future)

**Server Actions:**
- [ ] `getAttemptResultsAction(attemptId)` - Get results
- [ ] `getAttemptReviewAction(attemptId)` - Get review data

**Testing:**
- [ ] Unit tests for quiz attempt service
- [ ] Unit tests for grading service
- [ ] Integration tests for quiz taking flow
- [ ] Integration tests for grading logic

---

### Phase 3: Dashboard & Analytics
**Status:** ⏳ Pending
**Estimated Duration:** 3 days
**Goal:** Provide comprehensive dashboards with statistics and insights

#### Phase 3A: Student Dashboard Enhancement
**Estimated Duration:** 1 day

**Backend Tasks:**
- [ ] Create analytics service (`lib/services/analytics.service.ts`)
  - [ ] `getStudentStats(studentId)` - Get student statistics
  - [ ] `getStudentAttemptHistory(studentId, limit)` - Get recent attempts
  - [ ] `getStudentProgressOverTime(studentId)` - Get progress data
  - [ ] `getStudentQuizPerformance(studentId, quizId)` - Get quiz-specific stats

**Frontend Tasks:**
- [ ] Enhance student dashboard (`app/student/page.tsx`)
  - [ ] Statistics cards (total quizzes, average score, pass rate)
  - [ ] Recent attempts table with scores
  - [ ] Performance chart (score trend over time)
  - [ ] Recommended quizzes (future)

- [ ] Create statistics components
  - [ ] Stat card component (`components/dashboard/stat-card.tsx`)
  - [ ] Progress chart component (`components/dashboard/progress-chart.tsx`)
  - [ ] Attempt history table (`components/student/attempt-history-table.tsx`)

**Server Actions:**
- [ ] `getStudentStatsAction()` - Get student statistics
- [ ] `getStudentHistoryAction(limit)` - Get attempt history

---

#### Phase 3B: Instructor Dashboard Enhancement
**Estimated Duration:** 2 days

**Backend Tasks:**
- [ ] Extend analytics service for instructors
  - [ ] `getInstructorStats(instructorId)` - Get instructor statistics
  - [ ] `getQuizAnalytics(quizId)` - Get quiz-specific analytics
  - [ ] `getQuizAttemptSummary(quizId)` - Get attempt summary
  - [ ] `getStudentPerformanceByQuiz(quizId)` - Get student scores
  - [ ] `getQuestionAnalytics(quizId)` - Get question difficulty stats

**Frontend Tasks:**
- [ ] Enhance instructor dashboard (`app/instructor/page.tsx`)
  - [ ] Statistics cards (total quizzes, total students, average scores)
  - [ ] Recent quiz activity
  - [ ] Top performing quizzes
  - [ ] Student engagement metrics

- [ ] Create quiz analytics page (`app/instructor/quiz/[id]/analytics/page.tsx`)
  - [ ] Attempt summary (total attempts, completion rate)
  - [ ] Score distribution chart
  - [ ] Question difficulty analysis
  - [ ] Student performance table
  - [ ] Time spent analysis

- [ ] Create analytics components
  - [ ] Score distribution chart (`components/instructor/score-distribution-chart.tsx`)
  - [ ] Question performance table (`components/instructor/question-performance-table.tsx`)
  - [ ] Student performance table (`components/instructor/student-performance-table.tsx`)

**Server Actions:**
- [ ] `getInstructorStatsAction()` - Get instructor stats
- [ ] `getQuizAnalyticsAction(quizId)` - Get quiz analytics
- [ ] `getStudentPerformanceAction(quizId)` - Get student data

**Testing:**
- [ ] Unit tests for analytics service
- [ ] Integration tests for dashboard data

---

### Phase 4: Polish & Optimization
**Status:** ⏳ Pending
**Estimated Duration:** 2-3 days
**Goal:** Improve UX, performance, and add finishing touches

#### Phase 4A: UX Improvements
**Estimated Duration:** 1 day

**Tasks:**
- [ ] Add loading states for all async operations
- [ ] Add empty states for all lists
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add toast notifications for all actions
- [ ] Improve form error messages
- [ ] Add keyboard shortcuts for common actions
- [ ] Add breadcrumb navigation
- [ ] Add help tooltips where needed

---

#### Phase 4B: Performance & Security
**Estimated Duration:** 1 day

**Tasks:**
- [ ] Implement request caching where appropriate
- [ ] Add database query optimization
- [ ] Add pagination for large lists
- [ ] Implement rate limiting (future)
- [ ] Add CSRF protection verification
- [ ] Add input sanitization checks
- [ ] Security audit of all server actions
- [ ] Performance profiling and optimization

---

#### Phase 4C: Final Testing & Deployment
**Estimated Duration:** 1 day

**Tasks:**
- [ ] Complete end-to-end testing
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility testing (WCAG 2.1)
- [ ] Load testing with sample data
- [ ] Fix any remaining bugs
- [ ] Update documentation
- [ ] Deploy to production
- [ ] Post-deployment smoke testing

---

### Progress Tracking

**Overall Progress:**
- ✅ Phase 0: Foundation (100% complete)
- 🔄 Phase 1: Quiz Management (0% complete)
- ⏳ Phase 2: Quiz Taking (0% complete)
- ⏳ Phase 3: Dashboard & Analytics (0% complete)
- ⏳ Phase 4: Polish & Optimization (0% complete)

**Current Focus:** Phase 1A - Quiz Creation (Backend)

**Next Milestone:** Complete quiz service and question service implementation

---

## 20. Timeline and Milestones

### Overall Timeline
**Total Estimated Duration:** 12-15 days

- **Week 1:** Phase 0 (✅ Complete) + Phase 1 (Quiz Management)
- **Week 2:** Phase 2 (Quiz Taking) + Phase 3 (Dashboard & Analytics)
- **Week 3:** Phase 4 (Polish & Optimization) + Testing & Deployment

### Key Milestones
- ✅ **Milestone 0:** Authentication Complete (Dec 26, 2025)
- 🎯 **Milestone 1:** Instructors can create quizzes (Target: Dec 28, 2025)
- 🎯 **Milestone 2:** Students can take quizzes (Target: Dec 30, 2025)
- 🎯 **Milestone 3:** Dashboard analytics complete (Target: Jan 1, 2026)
- 🎯 **Milestone 4:** MVP deployed to production (Target: Jan 3, 2026)

---

## 21. Appendix

### Glossary
- **D1:** Cloudflare's distributed SQLite database
- **Server Action:** Next.js server-side function
- **shadcn/ui:** React component library
- **Wrangler:** Cloudflare CLI tool
- **Edge Computing:** Running code close to users globally

### References
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Document End**

