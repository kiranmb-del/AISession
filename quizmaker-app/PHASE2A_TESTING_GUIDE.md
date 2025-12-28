# Phase 2A Testing Guide

**Purpose:** Verify all Phase 2A functionality before proceeding to Phase 2B  
**Date:** December 28, 2025

---

## 🚀 Quick Start Testing

### 1. Start the Development Server

```bash
cd quizmaker-app
npm run dev
```

The app should start at `http://localhost:3000`

---

## 👥 Test Prerequisites

You'll need at least:
- **1 Instructor account** (to create and publish quizzes)
- **1 Student account** (to test student features)

### Create Test Accounts

1. **Register as Instructor:**
   - Go to: `http://localhost:3000/register`
   - Fill in details, select "Instructor" role
   - Remember credentials

2. **Register as Student:**
   - Logout (if logged in)
   - Go to: `http://localhost:3000/register`
   - Fill in details, select "Student" role
   - Remember credentials

---

## 📝 Instructor Setup (Create Test Quiz)

Before testing student features, create a published quiz:

### Step 1: Login as Instructor
- Go to: `http://localhost:3000/login`
- Use instructor credentials

### Step 2: Create a Quiz
1. Navigate to "My Quizzes"
2. Click "Create New Quiz"
3. Fill in:
   - **Title:** "Sample Math Quiz"
   - **Description:** "Test your math skills"
   - **Duration:** 15 minutes
   - **Passing Score:** 70%
4. Click "Create Quiz"

### Step 3: Add Questions
1. Click "Manage Questions"
2. Add at least 3 questions:

   **Question 1 (Multiple Choice):**
   - Text: "What is 2 + 2?"
   - Type: Multiple Choice
   - Options: 3, 4, 5, 6
   - Correct: 4
   - Points: 10

   **Question 2 (True/False):**
   - Text: "The Earth is flat"
   - Type: True/False
   - Correct: False
   - Points: 10

   **Question 3 (Short Answer):**
   - Text: "What is the capital of France?"
   - Type: Short Answer
   - Sample Answer: "Paris"
   - Points: 10

3. Save all questions

### Step 4: Publish the Quiz
1. Go back to quiz detail page
2. Click "Publish Quiz"
3. Confirm publication

✅ **Instructor setup complete!**

---

## 🎓 Phase 2A Student Testing Checklist

Now logout and login as the **Student** account.

### Test 1: Student Dashboard ✓

**URL:** `http://localhost:3000/student/dashboard`

**Expected Results:**
- ✅ See "Welcome back, [Your Name]!" greeting
- ✅ See 3 stat cards (should show 0s for new student):
  - Quizzes Taken: 0
  - Completed: 0
  - Average Score: N/A
- ✅ See "Quick Actions" section with 2 buttons
- ✅ "Recent Activity" shows "No quiz attempts yet"
- ✅ Theme toggle works (light/dark mode)
- ✅ Logout button works
- ✅ Emerald/cyan gradient theme visible

**Test Actions:**
1. Check all stat cards display correctly
2. Toggle theme (light/dark)
3. Hover over stat cards (should scale up slightly)
4. Click "Browse Available Quizzes" button

---

### Test 2: Quiz Browsing Page ✓

**URL:** `http://localhost:3000/student/quizzes`

**Expected Results:**
- ✅ See page title "Available Quizzes"
- ✅ See stats banner showing "1 Available Quiz"
- ✅ See quiz card for "Sample Math Quiz"
- ✅ Quiz card shows:
  - Title: "Sample Math Quiz"
  - Description: "Test your math skills"
  - Instructor name
  - Question count: 3 Questions
  - Duration: 15 min
  - Passing score: 70% to pass
  - "View Details" button
- ✅ Card has hover effect (scale and shadow)
- ✅ Back button navigates to dashboard

**Test Actions:**
1. Verify quiz card displays all information
2. Hover over quiz card (should scale up)
3. Test theme toggle
4. Click "View Details" button

---

### Test 3: Quiz Detail Page ✓

**URL:** `http://localhost:3000/student/quizzes/[quiz-id]`

**Expected Results:**
- ✅ See quiz title "Sample Math Quiz"
- ✅ See instructor name
- ✅ See "About This Quiz" section with description
- ✅ See "Quiz Information" sidebar with:
  - Questions: 3
  - Time Limit: 15 minutes
  - Passing Score: 70%
- ✅ See "Start Quiz" button (enabled, gradient style)
- ✅ See "Tips for Success" card
- ✅ NO "Active attempt" alert (first time)
- ✅ NO "Previous Attempts" section (first time)

**Test Actions:**
1. Verify all quiz information displays correctly
2. Check that "Start Quiz" button is enabled
3. Test theme toggle
4. Click "Back to Quizzes" button (should work)

---

### Test 4: Start Quiz Functionality ✓

**On Quiz Detail Page**

**Test Actions:**
1. Click "Start Quiz" button
2. Button should show "Starting..." with spinner
3. Should see success toast: "Quiz started! Good luck!"
4. Should redirect to quiz taking page

**Expected URL:** `http://localhost:3000/student/quizzes/[quiz-id]/attempt/[attempt-id]`

**Expected Results:**
- ✅ Redirects to quiz attempt page
- ✅ Success toast notification appears
- ✅ Quiz taking page shows (currently placeholder for Phase 2B)
- ✅ Page says "Quiz Taking Interface - Coming in Phase 2B"

---

### Test 5: Active Attempt Detection ✓

**Test Actions:**
1. Click "Back to Dashboard" from attempt placeholder
2. Navigate back to quiz detail page:
   - Option A: Dashboard → Browse Quizzes → Select same quiz
   - Option B: Direct URL: `/student/quizzes/[quiz-id]`

**Expected Results:**
- ✅ See blue alert box at top: "You have an active attempt"
- ✅ Alert shows start time
- ✅ "Start Quiz" button is replaced with "Continue Quiz" button
- ✅ "Continue Quiz" button uses emerald gradient
- ✅ Clicking "Continue Quiz" goes to attempt page

---

### Test 6: Duplicate Attempt Prevention ✓

**Test Actions:**
1. While on quiz detail page with active attempt
2. Open browser console (F12)
3. Try to manually call the API:
   ```javascript
   fetch('/api/student/quizzes/[quiz-id]/start', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   ```

**Expected Results:**
- ✅ API returns 400 error
- ✅ Error message: "You already have an in-progress attempt for this quiz"

---

### Test 7: Dashboard After Starting Quiz ✓

**Test Actions:**
1. Navigate back to student dashboard: `http://localhost:3000/student/dashboard`

**Expected Results:**
- ✅ Stat cards updated:
  - Quizzes Taken: 1
  - Completed: 0
  - Average Score: N/A (no completed yet)
- ✅ "Recent Activity" section shows 1 attempt:
  - Quiz title: "Sample Math Quiz"
  - Instructor name
  - Status badge: "in progress" (green)
  - "Continue" button visible
  - Date/time of start
- ✅ Clicking "Continue" goes to attempt page

---

## 🎨 UI/UX Testing Checklist

### Visual Design ✓
- ✅ Emerald → Cyan → Blue gradient backgrounds
- ✅ Glassmorphism header (blurred background)
- ✅ Smooth animations (fade-in on page load)
- ✅ Hover effects on cards (scale + shadow)
- ✅ Consistent button styles with gradients
- ✅ Student role badge (green) in header
- ✅ Icons from lucide-react display correctly

### Responsive Design ✓
Test on different screen sizes:
- ✅ Desktop (1920px) - 3-column grid
- ✅ Tablet (768px) - 2-column grid
- ✅ Mobile (375px) - 1-column layout
- ✅ Header remains sticky on scroll
- ✅ Buttons stack vertically on mobile

### Theme Toggle ✓
- ✅ Light mode: White backgrounds, dark text
- ✅ Dark mode: Dark backgrounds, light text
- ✅ Gradients adjust for theme
- ✅ Theme persists on page reload
- ✅ No flash of unstyled content

### Accessibility ✓
- ✅ All buttons keyboard accessible (Tab)
- ✅ Focus states visible
- ✅ Color contrast meets WCAG standards
- ✅ Alt text on icons
- ✅ Semantic HTML structure

---

## 🔒 Security Testing

### Role-Based Access ✓

**Test Actions:**
1. While logged in as student, try to access instructor pages:
   - `/dashboard/quizzes`
   - `/dashboard/quizzes/new`

**Expected Results:**
- ✅ Should redirect to student dashboard
- ✅ Cannot access instructor pages

### Authentication ✓

**Test Actions:**
1. Logout
2. Try to access: `/student/dashboard`

**Expected Results:**
- ✅ Redirects to login page
- ✅ Cannot access without authentication

---

## 🐛 Error Scenarios Testing

### Test 1: Unpublished Quiz
**Test Actions:**
1. Login as instructor
2. Create quiz but DON'T publish
3. Logout, login as student
4. Try to access quiz detail directly via URL

**Expected Results:**
- ✅ Redirects to quiz list (quiz not visible)

### Test 2: Non-existent Quiz
**Test Actions:**
1. Try URL: `/student/quizzes/fake-quiz-id`

**Expected Results:**
- ✅ Redirects to quiz list
- ✅ Or shows 404 error

### Test 3: Network Error
**Test Actions:**
1. Open DevTools → Network tab
2. Set network to "Offline"
3. Try to start a quiz

**Expected Results:**
- ✅ Error toast appears
- ✅ "Failed to start quiz" message
- ✅ Button returns to normal state

---

## ✅ Success Criteria

**Phase 2A is working correctly if:**

✅ Student can register and login  
✅ Student dashboard displays with correct stats  
✅ Student can browse published quizzes  
✅ Student can view quiz details  
✅ Student can start a quiz attempt  
✅ System prevents duplicate attempts  
✅ Dashboard shows recent activity  
✅ All UI elements render correctly  
✅ Theme toggle works  
✅ Responsive on mobile  
✅ Security checks pass  
✅ Error handling works  

---

## 📊 Performance Testing (Optional)

### Load Test
- Create 10+ published quizzes
- Browse quiz list (should load quickly)
- Check for layout issues with many cards

### Database Test
- Start 5+ quiz attempts (use different quizzes)
- Check dashboard loads all attempts
- Verify stats calculate correctly

---

## 🐛 Known Issues / Limitations

These are expected for Phase 2A:

1. ✅ **Quiz taking page is placeholder** - This is Phase 2B
2. ✅ **Cannot submit answers** - This is Phase 2B
3. ✅ **No grading** - This is Phase 2C
4. ✅ **No results page** - This is Phase 2C
5. ✅ **No attempt history page** - This is Phase 2C

These are NOT issues - they're planned for future phases.

---

## 📝 Testing Checklist Summary

Copy this checklist and mark off as you test:

```
Student Dashboard:
[ ] Stats display correctly (0s for new student)
[ ] Quick actions buttons work
[ ] Recent activity shows empty state
[ ] Theme toggle works
[ ] Responsive design works

Quiz Browsing:
[ ] Quiz cards display correctly
[ ] All quiz metadata shown
[ ] Hover effects work
[ ] View Details button works
[ ] Empty state works (if no quizzes)

Quiz Detail:
[ ] All quiz info displays
[ ] Sidebar shows correct metadata
[ ] Start button enabled (first time)
[ ] Tips card displays

Start Quiz:
[ ] Button shows loading state
[ ] Success toast appears
[ ] Redirects to attempt page
[ ] Attempt created in database

Active Attempt:
[ ] Alert shows for in-progress attempt
[ ] Continue button appears
[ ] Start button is replaced
[ ] Can navigate to attempt page

Duplicate Prevention:
[ ] Cannot start second attempt
[ ] API returns proper error
[ ] UI prevents duplicate starts

Dashboard Updates:
[ ] Stats update after starting quiz
[ ] Recent activity shows attempt
[ ] Continue button works

UI/UX:
[ ] Emerald/cyan theme consistent
[ ] Animations smooth
[ ] Icons display correctly
[ ] Responsive on mobile

Security:
[ ] Cannot access instructor pages
[ ] Redirects when not authenticated
[ ] Role validation works

Error Handling:
[ ] Unpublished quizzes hidden
[ ] Invalid quiz IDs handled
[ ] Network errors show toast
```

---

## 🆘 Troubleshooting

### Issue: "No quizzes showing"
**Solution:** Make sure instructor published the quiz (not just created)

### Issue: "Start button doesn't work"
**Solution:** Check browser console for errors, verify API route exists

### Issue: "Redirects to wrong page"
**Solution:** Check role is correctly set to "student"

### Issue: "Theme not working"
**Solution:** Clear browser cache, ensure theme provider is set up

### Issue: "Stats showing wrong numbers"
**Solution:** Check database has correct data, verify SQL queries

---

## 📧 Report Issues

If you find any bugs during testing, note:
1. What you were doing
2. What you expected to happen
3. What actually happened
4. Browser console errors (if any)
5. Screenshots (if helpful)

---

**Happy Testing! 🧪**

Once you've verified everything works, we can confidently move to Phase 2B! 🚀

