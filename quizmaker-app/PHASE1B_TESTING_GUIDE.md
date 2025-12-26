# Phase 1B: Question Management - Testing Guide

**Implementation Complete - Ready for Testing! 🧪**

---

## 🚀 Starting the Application

```bash
cd quizmaker-app
npm run dev
```

The application should start at `http://localhost:3000`

---

## 🧪 Testing Checklist

### Prerequisites
1. ✅ Make sure you have an instructor account created
2. ✅ Create at least one quiz to test with

### Test Scenario 1: Create Multiple Choice Question

1. **Navigate to Questions Page**
   - Go to Dashboard → Quizzes
   - Click "Manage Questions" on any quiz
   
2. **Add Multiple Choice Question**
   - Click "Add New Question" button
   - Verify the question editor appears with beautiful gradient styling
   - Select "Multiple Choice" from dropdown
   - Enter question text: "What is 2+2?"
   - Set points: 5
   - Add options:
     - Option 1: "3" (not correct)
     - Option 2: "4" (mark as correct - click the circle)
     - Option 3: "5" (not correct)
   - Click "Add Question"
   
3. **Verify Question Created**
   - ✅ Question appears in the list
   - ✅ Shows "Multiple Choice" blue badge
   - ✅ Shows "5 pts" badge
   - ✅ Correct answer (4) has green indicator
   - ✅ Toast notification appears

### Test Scenario 2: Create True/False Question

1. **Add True/False Question**
   - Click "Add New Question"
   - Select "True/False"
   - Enter question: "The sky is blue"
   - Set points: 1
   - Click on "True" card to select it as correct
   - Verify the True card highlights in green
   - Click "Add Question"
   
2. **Verify Question Created**
   - ✅ Shows "True/False" green badge
   - ✅ Shows correct answer in preview

### Test Scenario 3: Create Short Answer Question

1. **Add Short Answer Question**
   - Click "Add New Question"
   - Select "Short Answer"
   - Enter question: "Explain photosynthesis"
   - Set points: 10
   - Enter sample answer: "Photosynthesis is the process plants use to convert sunlight into energy using chlorophyll..."
   - Enter grading guidelines: "Look for mention of: chlorophyll, sunlight, carbon dioxide, oxygen"
   - Click "Add Question"
   
2. **Verify Question Created**
   - ✅ Shows "Short Answer" purple badge
   - ✅ Shows manual grading info banner

### Test Scenario 4: Edit Question

1. **Edit Existing Question**
   - Click "Edit" button on any question
   - Verify the question editor opens inline
   - Modify question text
   - Change points value
   - For multiple choice: add/remove options
   - Click "Save Changes"
   
2. **Verify Changes**
   - ✅ Question updates immediately
   - ✅ Toast notification appears
   - ✅ Editor closes

### Test Scenario 5: Drag-and-Drop Reordering

1. **Reorder Questions**
   - Hover over a question card
   - Grab the grip handle (vertical dots icon) on the left
   - Drag the question up or down
   - Drop it in a new position
   
2. **Verify Reordering**
   - ✅ Question moves to new position
   - ✅ Question numbers update
   - ✅ Toast notification confirms save
   - ✅ Refresh page - order persists

### Test Scenario 6: Delete Question

1. **Delete Question**
   - Click "Delete" button on any question
   - Verify confirmation prompt appears
   - Click "OK" to confirm
   
2. **Verify Deletion**
   - ✅ Question removed from list
   - ✅ Remaining questions reordered
   - ✅ Toast notification appears

### Test Scenario 7: Quiz Preview

1. **Open Preview**
   - Click "Preview Quiz" button (eye icon)
   - Verify modal opens with quiz title and description
   - View quiz statistics at top
   
2. **Navigate Questions**
   - Click "Next" to go through questions
   - Click "Previous" to go back
   - Verify question counter updates
   
3. **Show Answers**
   - Click "Show Answers" button
   - ✅ Correct answers highlight in green
   - ✅ "Correct" badges appear
   - Click "Hide Answers" to toggle off
   
4. **Test All Question Types**
   - Multiple Choice: See options with radio buttons
   - True/False: See True/False buttons
   - Short Answer: See text area with sample answer (when answers shown)

### Test Scenario 8: Theme Toggle

1. **Test Dark Mode**
   - Click theme toggle in header
   - ✅ All components switch to dark theme
   - ✅ Gradients adapt to dark mode
   - ✅ Text remains readable
   - ✅ Cards have proper contrast

### Test Scenario 9: Empty State

1. **View Empty Quiz**
   - Create a new quiz without questions
   - Navigate to "Manage Questions"
   - ✅ Empty state appears with illustration
   - ✅ "Add First Question" button works

### Test Scenario 10: Mobile Responsiveness

1. **Test on Small Screen**
   - Resize browser to mobile width (375px)
   - ✅ Header adapts
   - ✅ Buttons stack properly
   - ✅ Question cards remain readable
   - ✅ Editor is usable
   - ✅ Preview modal works

---

## 🐛 Common Issues to Watch For

### If Questions Don't Load
- Check browser console for errors
- Verify you're logged in as an instructor
- Check that the quiz exists and you own it

### If Drag-and-Drop Doesn't Work
- Make sure you're grabbing the grip handle (not the card)
- Try refreshing the page
- Check browser console for errors

### If Tests Fail
```bash
npm run test
```
- All 18 tests should pass
- If `server-only` error appears, verify `vitest.config.ts` has the alias

### If Theme Toggle Doesn't Work
- Clear browser cache
- Check that ThemeProvider is in layout.tsx
- Verify theme preference is saved in localStorage

---

## ✅ Expected Results

After testing all scenarios, you should have:

1. **Multiple quizzes** with various questions
2. **Different question types** (MC, TF, SA) working correctly
3. **Drag-and-drop** functioning smoothly
4. **Preview** showing student view accurately
5. **Edit/Delete** working without errors
6. **Theme toggle** switching between light/dark
7. **Mobile responsive** layout working
8. **All tests passing** (18/18)

---

## 📸 Visual Checklist

### Beautiful UI Elements to Verify
- ✅ Gradient backgrounds (blue → white → purple)
- ✅ Glassmorphism header with blur effect
- ✅ Smooth animations on card hover
- ✅ Color-coded question type badges
- ✅ Green highlighting for correct answers
- ✅ Grip handle icons for drag-and-drop
- ✅ Toast notifications on actions
- ✅ Consistent spacing and typography
- ✅ Theme toggle works smoothly

---

## 🎯 Key Features to Test

### Question Creation
- [ ] Multiple choice with 2-10 options
- [ ] True/False with correct answer selection
- [ ] Short answer with optional sample/guidelines
- [ ] Points allocation (1-100)
- [ ] Character limits enforced
- [ ] Validation errors display correctly

### Question Management
- [ ] Inline editing without page reload
- [ ] Delete with confirmation
- [ ] Drag-and-drop reordering
- [ ] Order persists after refresh
- [ ] Ownership validation (can only edit your own)

### Quiz Preview
- [ ] All question types render correctly
- [ ] Navigation works (Next/Previous)
- [ ] Show/Hide answers toggle
- [ ] Modal closes properly
- [ ] Looks good on mobile

---

## 🚨 Report Any Issues

If you find any bugs or unexpected behavior:
1. Note the steps to reproduce
2. Check browser console for errors
3. Note which scenario failed
4. Let me know and I'll fix it!

---

## 🎉 Once Testing is Complete

When everything works correctly:
1. I'll help you commit the changes
2. Create a git tag for Phase 1B
3. Update the roadmap
4. Prepare for Phase 2: Quiz Taking

---

**Happy Testing! 🧪✨**

