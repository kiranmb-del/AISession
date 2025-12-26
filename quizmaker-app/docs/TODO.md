# QuizMaker TODO Tracker

**Current Phase:** Phase 1A - Quiz Creation (Backend)
**Last Updated:** December 26, 2025

---

## 🔥 Current Focus: Phase 1A - Quiz Creation Backend

### Database Verification (Do This First!)

#### Verify Existing Schema
- [ ] Check `quizzes` table structure
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "PRAGMA table_info(quizzes)"
  ```
  - [ ] Verify columns: id, title, description, instructor_id, duration_minutes, passing_score, is_published, created_at, updated_at
  - [ ] Verify data types match expectations

- [ ] Check `questions` table structure
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "PRAGMA table_info(questions)"
  ```
  - [ ] Verify columns: id, quiz_id, question_text, question_type, points, order_index, created_at
  - [ ] Verify CHECK constraint on question_type

- [ ] Check `answer_options` table structure
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "PRAGMA table_info(answer_options)"
  ```
  - [ ] Verify columns: id, question_id, option_text, is_correct, order_index

- [ ] Verify foreign keys
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "PRAGMA foreign_key_list(quizzes)"
  npx wrangler d1 execute quizmaker-app-database --local --command "PRAGMA foreign_key_list(questions)"
  npx wrangler d1 execute quizmaker-app-database --local --command "PRAGMA foreign_key_list(answer_options)"
  ```
  - [ ] quizzes.instructor_id → users.id (CASCADE)
  - [ ] questions.quiz_id → quizzes.id (CASCADE)
  - [ ] answer_options.question_id → questions.id (CASCADE)

- [ ] Verify indexes exist
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "SELECT * FROM sqlite_master WHERE type='index'"
  ```
  - [ ] idx_quizzes_instructor on quizzes(instructor_id)
  - [ ] idx_quizzes_published on quizzes(is_published)
  - [ ] idx_questions_quiz on questions(quiz_id)
  - [ ] idx_answer_options_question on answer_options(question_id)

#### Test Database Operations
- [ ] Test quiz insertion
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "INSERT INTO quizzes (id, title, instructor_id, is_published) VALUES ('test-1', 'Test Quiz', 'user-id', 0)"
  ```

- [ ] Test quiz retrieval
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "SELECT * FROM quizzes WHERE id='test-1'"
  ```

- [ ] Test cascade delete (create question, then delete quiz)
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "INSERT INTO questions (id, quiz_id, question_text, question_type, order_index) VALUES ('q-1', 'test-1', 'Test?', 'multiple_choice', 0)"
  npx wrangler d1 execute quizmaker-app-database --local --command "DELETE FROM quizzes WHERE id='test-1'"
  npx wrangler d1 execute quizmaker-app-database --local --command "SELECT * FROM questions WHERE id='q-1'"
  ```
  - [ ] Verify question was auto-deleted

- [ ] Clean up test data
  ```bash
  npx wrangler d1 execute quizmaker-app-database --local --command "DELETE FROM quizzes WHERE id LIKE 'test-%'"
  ```

---

### Backend Implementation

#### Quiz Service (`lib/services/quiz.service.ts`)
- [ ] Set up service file with imports and types
- [ ] Implement `createQuiz(instructorId, quizData)`
  - [ ] Validate quiz data
  - [ ] Generate quiz ID
  - [ ] Insert into database
  - [ ] Return quiz object
- [ ] Implement `getQuizById(quizId, userId?)`
  - [ ] Fetch quiz from database
  - [ ] Optional ownership check
  - [ ] Return quiz with metadata
- [ ] Implement `getQuizzesByInstructor(instructorId)`
  - [ ] Query quizzes by instructor_id
  - [ ] Include question count
  - [ ] Order by created_at DESC
- [ ] Implement `updateQuiz(quizId, instructorId, quizData)`
  - [ ] Verify ownership
  - [ ] Update quiz fields
  - [ ] Update updated_at timestamp
- [ ] Implement `deleteQuiz(quizId, instructorId)`
  - [ ] Verify ownership
  - [ ] Cascade delete (handled by FK constraints)
  - [ ] Return success status
- [ ] Implement `publishQuiz(quizId, instructorId)`
  - [ ] Verify ownership
  - [ ] Validate quiz has questions
  - [ ] Set is_published = 1
- [ ] Implement `unpublishQuiz(quizId, instructorId)`
  - [ ] Verify ownership
  - [ ] Set is_published = 0

#### Question Service (`lib/services/question.service.ts`)
- [ ] Set up service file with imports and types
- [ ] Implement `createQuestion(quizId, questionData)`
  - [ ] Verify quiz exists and ownership
  - [ ] Generate question ID
  - [ ] Insert question
  - [ ] Create answer options if provided
- [ ] Implement `getQuestionsByQuiz(quizId)`
  - [ ] Query questions by quiz_id
  - [ ] Include answer options
  - [ ] Order by order_index
- [ ] Implement `updateQuestion(questionId, questionData)`
  - [ ] Update question fields
  - [ ] Handle answer options updates
- [ ] Implement `deleteQuestion(questionId)`
  - [ ] Delete question (cascade deletes options)
- [ ] Implement `reorderQuestions(quizId, questionIds)`
  - [ ] Update order_index for each question
- [ ] Implement `createAnswerOption(questionId, optionData)`
  - [ ] Generate option ID
  - [ ] Insert answer option
- [ ] Implement `updateAnswerOption(optionId, optionData)`
  - [ ] Update option fields
- [ ] Implement `deleteAnswerOption(optionId)`
  - [ ] Delete option

#### Validation Schemas

##### Quiz Schema (`lib/schemas/quiz.schema.ts`)
- [ ] Create file and import Zod
- [ ] Define `QuizSchema`
  - [ ] title: string, min 1, max 200
  - [ ] description: string, optional, max 1000
  - [ ] duration_minutes: number, optional, min 1, max 600
  - [ ] passing_score: number, optional, min 0, max 100
- [ ] Export TypeScript type `Quiz`
- [ ] Define `QuizUpdateSchema` (partial quiz)

##### Question Schema (`lib/schemas/question.schema.ts`)
- [ ] Create file and import Zod
- [ ] Define `QuestionSchema`
  - [ ] question_text: string, min 1, max 500
  - [ ] question_type: enum ['multiple_choice', 'true_false', 'short_answer']
  - [ ] points: number, min 1, max 100
  - [ ] order_index: number, min 0
- [ ] Define `AnswerOptionSchema`
  - [ ] option_text: string, min 1, max 200
  - [ ] is_correct: boolean
  - [ ] order_index: number, min 0
- [ ] Export TypeScript types

#### Server Actions (`app/actions/quiz.ts`)
- [ ] Create file with 'use server' directive
- [ ] Import services and schemas
- [ ] Implement `createQuizAction(formData)`
  - [ ] Get current user from auth
  - [ ] Verify user is instructor
  - [ ] Validate form data with schema
  - [ ] Call quiz service
  - [ ] Handle errors
  - [ ] Return result
- [ ] Implement `updateQuizAction(quizId, formData)`
  - [ ] Get current user
  - [ ] Verify instructor
  - [ ] Validate data
  - [ ] Call update service
- [ ] Implement `deleteQuizAction(quizId)`
  - [ ] Get current user
  - [ ] Verify instructor
  - [ ] Call delete service
- [ ] Implement `publishQuizAction(quizId)`
  - [ ] Get current user
  - [ ] Verify instructor
  - [ ] Call publish service
- [ ] Implement `getInstructorQuizzesAction()`
  - [ ] Get current user
  - [ ] Verify instructor
  - [ ] Return quizzes

---

### Frontend Implementation

#### Instructor Dashboard (`app/instructor/page.tsx`)
- [ ] Create page file with proper exports
- [ ] Get current user (verify instructor role)
- [ ] Fetch instructor quizzes
- [ ] Create page layout
  - [ ] Header with welcome message
  - [ ] Statistics cards section
  - [ ] Quiz list section
  - [ ] Create quiz button (prominent)
- [ ] Add empty state for no quizzes
- [ ] Add loading state
- [ ] Add error handling

#### New Quiz Page (`app/instructor/quiz/new/page.tsx`)
- [ ] Create page file
- [ ] Set up React Hook Form with Zod resolver
- [ ] Create form with fields:
  - [ ] Title input (required)
  - [ ] Description textarea (optional)
  - [ ] Duration input in minutes (optional)
  - [ ] Passing score input (percentage, optional)
- [ ] Add form validation and error display
- [ ] Implement form submission
  - [ ] Call createQuizAction
  - [ ] Handle loading state
  - [ ] Handle errors
  - [ ] Redirect to questions page on success
- [ ] Add "Save as Draft" button
- [ ] Add "Cancel" button (go back)
- [ ] Style with Tailwind and shadcn/ui

#### Quiz List Component (`components/instructor/quiz-list.tsx`)
- [ ] Create component file
- [ ] Accept quizzes prop
- [ ] Display quizzes in table or card layout
  - [ ] Quiz title
  - [ ] Description (truncated)
  - [ ] Number of questions
  - [ ] Status badge (draft/published)
  - [ ] Created date
  - [ ] Actions menu
- [ ] Implement actions:
  - [ ] Edit quiz (navigate to edit page)
  - [ ] Delete quiz (with confirmation)
  - [ ] Publish/Unpublish toggle
  - [ ] View analytics (future)
- [ ] Add responsive design (cards on mobile)
- [ ] Add sorting options
- [ ] Add search/filter functionality

#### Confirm Dialog Component (`components/ui/confirm-dialog.tsx`)
- [ ] Create reusable confirmation dialog
- [ ] Props: title, description, confirmText, onConfirm, onCancel
- [ ] Use shadcn/ui Dialog component
- [ ] Style for destructive actions (red for delete)

---

### Testing

#### Unit Tests
- [ ] Test `quiz.service.ts`
  - [ ] Test createQuiz with valid data
  - [ ] Test createQuiz with invalid data
  - [ ] Test getQuizById
  - [ ] Test ownership validation
  - [ ] Test publish/unpublish
- [ ] Test `question.service.ts`
  - [ ] Test createQuestion
  - [ ] Test getQuestionsByQuiz
  - [ ] Test answer option operations

#### Integration Tests
- [ ] Test quiz creation flow end-to-end
- [ ] Test quiz update with ownership check
- [ ] Test quiz deletion with cascade

---

## 📋 Phase 1B - Question Management (Next)

### When Phase 1A is Complete, Start Here:

#### Frontend Components
- [ ] Question builder page
- [ ] Question editor component
- [ ] Multiple choice editor
- [ ] True/False editor
- [ ] Short answer editor
- [ ] Quiz preview modal

#### Backend
- [ ] Question actions (`app/actions/question.ts`)
- [ ] Reordering logic
- [ ] Bulk operations support

---

## ⏭️ Future Phases (Reference Only)

### Phase 2: Quiz Taking
- Student dashboard
- Quiz list for students
- Quiz taking interface
- Timer functionality
- Results and review pages
- Grading service

### Phase 3: Dashboard & Analytics
- Student statistics
- Instructor analytics
- Performance charts
- Question difficulty analysis

### Phase 4: Polish
- Loading states
- Empty states
- Confirmation dialogs
- Toast notifications
- Performance optimization
- Security audit
- Production deployment

---

## 📝 Notes

### Important Reminders
- Always verify user authentication in server actions
- Always verify ownership before allowing edits/deletes
- Use prepared statements for all database queries (handled by d1-client)
- Follow the D1 client patterns (executeQuery, executeMutation, etc.)
- Use Zod schemas for all form validation
- Use shadcn/ui components for all UI elements
- Keep services pure (no direct request/response handling)
- Server actions handle auth and call services

### Common Patterns

#### Service Function Pattern
```typescript
export async function serviceName(param: string): Promise<ReturnType> {
  const db = getDatabase();
  
  // Validation
  if (!param) {
    throw new Error('Param is required');
  }
  
  // Database operation
  const result = await executeQueryFirst<ReturnType>(
    db,
    'SELECT * FROM table WHERE id = ?',
    [param]
  );
  
  if (!result) {
    throw new Error('Not found');
  }
  
  return result;
}
```

#### Server Action Pattern
```typescript
'use server'

export async function actionName(formData: FormType): Promise<ActionResult> {
  // Get current user
  const user = await getCurrentUser();
  
  // Verify authentication
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Verify role if needed
  if (user.user_type !== 'instructor') {
    return { success: false, error: 'Forbidden' };
  }
  
  // Validate input
  const validated = Schema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }
  
  try {
    // Call service
    const result = await serviceFunction(user.id, validated.data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Action error:', error);
    return { success: false, error: 'Operation failed' };
  }
}
```

---

## ✅ Completed

### Phase 0: Foundation
- ✅ Database schema and migrations
- ✅ D1 client setup
- ✅ User service
- ✅ Auth service
- ✅ Login page
- ✅ Registration page
- ✅ Authentication flow
- ✅ Cookie management
- ✅ Password hashing

---

**Next Action:** Start implementing `lib/services/quiz.service.ts` 🚀

