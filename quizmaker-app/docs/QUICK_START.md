# 🚀 QuizMaker Quick Start Guide

## 🎯 Where We Are
- **Status:** Login/Registration ✅ Complete
- **Current Phase:** Phase 1A - Quiz Creation (Backend)
- **Next Milestone:** Instructors can create quizzes (Dec 28, 2025)

---

## 📋 Current Sprint: Phase 1A (2 days)

### What We're Building
Enable instructors to create and manage quizzes with basic information (title, description, duration, passing score).

### Tasks This Sprint

#### Database Verification (Priority 0 - Do First!) 🔥
- [ ] Verify `quizzes` table structure and indexes
- [ ] Verify `questions` table structure and foreign keys
- [ ] Verify `answer_options` table structure
- [ ] Test cascade delete behavior
- [ ] Test basic CRUD operations via CLI

**See TODO.md for detailed database verification commands**

#### Backend (Priority 1) 🔥
- [ ] `lib/services/quiz.service.ts` - Quiz CRUD operations
- [ ] `lib/services/question.service.ts` - Question & answer management  
- [ ] `lib/schemas/quiz.schema.ts` - Quiz validation
- [ ] `lib/schemas/question.schema.ts` - Question validation
- [ ] `app/actions/quiz.ts` - Server actions

#### Frontend (Priority 2)
- [ ] `app/instructor/page.tsx` - Dashboard
- [ ] `app/instructor/quiz/new/page.tsx` - Create quiz form
- [ ] `components/instructor/quiz-list.tsx` - List component
- [ ] `components/ui/confirm-dialog.tsx` - Confirmation dialog

#### Testing (Priority 3)
- [ ] Unit tests for quiz service
- [ ] Unit tests for question service
- [ ] Integration test for quiz creation

---

## 🗺️ Big Picture Roadmap

```
✅ Phase 0: Foundation          (DONE)
🔄 Phase 1: Quiz Management     (IN PROGRESS) ← YOU ARE HERE
⏳ Phase 2: Quiz Taking         (NEXT)
⏳ Phase 3: Dashboard Analytics (AFTER)
⏳ Phase 4: Polish & Deploy     (FINAL)
```

---

## 📁 Key Files Reference

### Services (Business Logic)
```
lib/services/
├─ user.service.ts         ✅ Complete
├─ auth.service.ts         ✅ Complete
├─ quiz.service.ts         🎯 Build This
└─ question.service.ts     🎯 Build This
```

### Server Actions (API Layer)
```
app/actions/
├─ auth.ts                 ✅ Complete
└─ quiz.ts                 🎯 Build This
```

### Schemas (Validation)
```
lib/schemas/
├─ user.schema.ts          ✅ Complete
├─ quiz.schema.ts          🎯 Build This
└─ question.schema.ts      🎯 Build This
```

### Pages (UI)
```
app/
├─ login/page.tsx          ✅ Complete
├─ register/page.tsx       ✅ Complete
└─ instructor/
   ├─ page.tsx             🎯 Build This (Dashboard)
   └─ quiz/
      └─ new/page.tsx      🎯 Build This (Create Quiz)
```

---

## 🔨 Implementation Order

### Step 0: Database Verification (30 mins) 🔥 **START HERE**
1. Verify all tables exist with correct structure
2. Verify foreign key constraints
3. Verify indexes are in place
4. Test cascade delete behavior
5. Test basic insert/select operations

**Commands in TODO.md - Run these first!**

### Step 1: Quiz Service (1-2 hours)
1. Create `lib/services/quiz.service.ts`
2. Implement CRUD functions:
   - `createQuiz()`
   - `getQuizById()`
   - `getQuizzesByInstructor()`
   - `updateQuiz()`
   - `deleteQuiz()`
   - `publishQuiz()`
   - `unpublishQuiz()`

### Step 2: Question Service (1-2 hours)
1. Create `lib/services/question.service.ts`
2. Implement functions:
   - `createQuestion()`
   - `getQuestionsByQuiz()`
   - `updateQuestion()`
   - `deleteQuestion()`
   - `createAnswerOption()`
   - Answer option CRUD

### Step 3: Schemas (30 mins)
1. Create `lib/schemas/quiz.schema.ts`
2. Create `lib/schemas/question.schema.ts`

### Step 4: Server Actions (1 hour)
1. Create `app/actions/quiz.ts`
2. Implement actions with auth checks

### Step 5: Instructor Dashboard (2 hours)
1. Create `app/instructor/page.tsx`
2. Fetch and display quizzes
3. Add create button

### Step 6: Create Quiz Form (2 hours)
1. Create `app/instructor/quiz/new/page.tsx`
2. Form with validation
3. Connect to server action

### Step 7: Quiz List Component (1 hour)
1. Create `components/instructor/quiz-list.tsx`
2. Display, edit, delete functionality

### Step 8: Testing (2 hours)
1. Write unit tests
2. Test ownership validation
3. Test full flow

**Total Estimated Time: 11-13 hours (1.5-2 days)**

**Note:** Step 0 (Database Verification) is critical - don't skip it!

---

## ✅ Success Criteria

### Phase 1A is Complete When:
- ✅ Instructors can create a new quiz
- ✅ Instructors can see their quiz list
- ✅ Instructors can edit quiz details
- ✅ Instructors can delete their quizzes
- ✅ Instructors can publish/unpublish quizzes
- ✅ Ownership is validated on all operations
- ✅ Basic unit tests pass

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Create quiz with all fields
- [ ] Create quiz with only required fields
- [ ] Try to create quiz as student (should fail)
- [ ] Edit own quiz
- [ ] Try to edit another instructor's quiz (should fail)
- [ ] Delete quiz
- [ ] Publish/unpublish quiz

### Automated Testing
- [ ] Unit test: `createQuiz()` with valid data
- [ ] Unit test: `createQuiz()` with invalid data
- [ ] Unit test: Ownership validation
- [ ] Unit test: Publish requires questions (Phase 1B)
- [ ] Integration test: Full quiz creation flow

---

## 🎨 UI Components to Use

### shadcn/ui Components
- `Button` - All buttons
- `Card` - Quiz cards
- `Input` - Text inputs
- `Textarea` - Description field
- `Form` - Form wrapper
- `Label` - Form labels
- `Badge` - Status indicators
- `Dialog` - Confirmation modals
- `Table` - Quiz list (alternative to cards)

### Icons (lucide-react)
- `Plus` - Create button
- `Edit` - Edit action
- `Trash` - Delete action
- `Eye` - Publish action
- `EyeOff` - Unpublish action
- `MoreVertical` - Actions menu

---

## 📝 Code Patterns

### Service Function Template
```typescript
export async function serviceName(
  param: string
): Promise<ReturnType> {
  const db = getDatabase();
  
  // Validate input
  if (!param) throw new Error('Required');
  
  // Execute query
  const result = await executeQueryFirst<Type>(
    db,
    'SELECT ...',
    [param]
  );
  
  if (!result) throw new Error('Not found');
  return result;
}
```

### Server Action Template
```typescript
'use server'

export async function actionName(
  data: InputType
): Promise<ActionResult> {
  // 1. Auth
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  // 2. Validate role
  if (user.user_type !== 'instructor') {
    return { success: false, error: 'Forbidden' };
  }
  
  // 3. Validate input
  const validated = Schema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: 'Invalid data' };
  }
  
  // 4. Call service
  try {
    const result = await service(user.id, validated.data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}
```

---

## 🔐 Security Checklist

Every server action MUST:
- ✅ Check if user is authenticated
- ✅ Verify user has correct role
- ✅ Validate ownership for edit/delete
- ✅ Validate input with Zod
- ✅ Use prepared statements (via d1-client)
- ✅ Never expose sensitive data

---

## 🚨 Common Pitfalls to Avoid

1. ❌ **Don't** skip authentication checks
2. ❌ **Don't** skip ownership validation
3. ❌ **Don't** use raw SQL (use d1-client helpers)
4. ❌ **Don't** skip input validation
5. ❌ **Don't** forget to handle errors
6. ❌ **Don't** use HTML inputs (use shadcn/ui)
7. ❌ **Don't** write custom CSS (use Tailwind)

---

## 📞 Quick Commands

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Type check
npx tsc --noEmit

# Check DB
npx wrangler d1 execute quizmaker-app-database --local --command "SELECT * FROM quizzes"

# Create migration
npx wrangler d1 migrations create quizmaker-app-database <name>
```

---

## 📚 Documentation Links

- **TODO.md** - Detailed task checklist
- **IMPLEMENTATION_ROADMAP.md** - Full phase breakdown
- **IMPLEMENTATION_FLOW.md** - Visual diagrams
- **TECHNICAL_PRD.md** - Complete specification

---

## 🎯 Next Actions

1. **NOW:** Start building `lib/services/quiz.service.ts`
2. **THEN:** Build `lib/services/question.service.ts`
3. **AFTER:** Create schemas and server actions
4. **FINALLY:** Build the UI

---

## 💡 Pro Tips

- ✨ **Build backend first** - Services → Actions → UI
- ✨ **Test as you go** - Don't accumulate bugs
- ✨ **Follow the patterns** - Use existing code as reference
- ✨ **Check ownership** - Every edit/delete must verify
- ✨ **Use TypeScript** - Let types guide you
- ✨ **Read error messages** - They usually tell you what's wrong

---

**Ready to build? Start with `lib/services/quiz.service.ts`! 🚀**

