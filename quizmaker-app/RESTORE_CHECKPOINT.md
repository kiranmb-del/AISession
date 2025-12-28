# How to Restore Working Checkpoints

This document explains how to restore any of the saved checkpoints - stable, fully working states of the application.

## 📌 Available Checkpoints

### Latest: Phase 2A Complete (Recommended)
- **Tag**: `phase-2a-complete`
- **Date**: December 28, 2025
- **What's Included**:
  - ✅ Everything from Phase 1B
  - ✅ Student interface (dashboard, quiz browsing, quiz details)
  - ✅ Quiz attempt service with 9 methods
  - ✅ Student API routes (3 endpoints)
  - ✅ Start quiz functionality
  - ✅ All critical bugs fixed (auth, logout, theme toggle)
  - ✅ 18 additional unit tests (48 total)
  - ✅ Production-ready student flow
  - ✅ Role-based login redirects

### Phase 1B Complete
- **Tag**: `phase-1b-complete`
- **Date**: December 27, 2025
- **What's Included**:
  - ✅ Everything from Phase 1A
  - ✅ Question management (Multiple Choice, True/False, Short Answer)
  - ✅ Drag-and-drop question reordering
  - ✅ Quiz preview modal
  - ✅ Question editor components
  - ✅ 18 unit tests for questions (30 total)

### Phase 1A Complete
- **Tag**: `phase-1a-complete`
- **Date**: December 26, 2025
- **What's Included**:
  - ✅ Quiz management (CRUD operations)
  - ✅ Enhanced UI with theme toggle (light/dark mode)
  - ✅ Search, filter, and sort functionality
  - ✅ Publish/unpublish quizzes
  - ✅ 12 unit tests for quizzes

## 🔍 View Available Checkpoints

```bash
# View all saved tags/checkpoints
git tag

# Output should show:
# phase-1a-complete
# phase-1b-complete
# phase-2a-complete

# View commit history
git log --oneline

# View detailed info for a specific checkpoint
git show phase-2a-complete
git show phase-1b-complete
git show phase-1a-complete
```

## 🔄 Restore a Checkpoint

### Option 1: Temporary Checkout (Read-Only)
Use this to inspect a checkpoint without making permanent changes:

```bash
# Restore to latest checkpoint (Phase 2A)
git checkout phase-2a-complete

# Or restore to Phase 1B
git checkout phase-1b-complete

# Or restore to Phase 1A
git checkout phase-1a-complete
```

To go back to your current work:
```bash
git checkout main
```

### Option 2: Permanent Reset (⚠️ Discards Current Changes)
Use this to permanently restore to a checkpoint (WARNING: This will discard any uncommitted changes):

```bash
# First, commit or stash your current work if needed
git stash

# Reset to the latest checkpoint (Phase 2A)
git reset --hard phase-2a-complete

# Or reset to Phase 1B
git reset --hard phase-1b-complete

# Or reset to Phase 1A
git reset --hard phase-1a-complete

# Push the reset to remote (if needed)
git push origin main --force
```

### Option 3: Create a Backup Branch
Create a new branch from a checkpoint without affecting your main branch:

```bash
# Create branch from Phase 2A
git checkout -b backup-phase-2a phase-2a-complete

# Or from Phase 1B
git checkout -b backup-phase-1b phase-1b-complete

# Or from Phase 1A
git checkout -b backup-phase-1a phase-1a-complete

# Create without switching
git branch backup-phase-2a phase-2a-complete
```

## 🛡️ Before Restoring (Important!)

1. **Save Your Current Work**:
   ```bash
   # Option A: Commit your current changes
   git add .
   git commit -m "WIP: Saving current work"
   
   # Option B: Stash your changes
   git stash save "My current work in progress"
   ```

2. **Check What Will Be Lost**:
   ```bash
   # See uncommitted changes
   git status
   
   # See difference between current state and checkpoint
   git diff phase-1a-complete
   ```

## 🔧 After Restoring

Once you've restored the checkpoint, you may need to:

1. **Reinstall Dependencies** (if package.json changed):
   ```bash
   npm install
   ```

2. **Rebuild the Database** (if needed):
   ```bash
   # The local database should be in .wrangler/state/v3/d1/
   # If missing, re-run migrations:
   npx wrangler d1 execute quizmakerDatabase --local --file=migrations/0001_create_users_table.sql
   npx wrangler d1 execute quizmakerDatabase --local --file=migrations/0002_create_quizzes_table.sql
   # ... (repeat for all 6 migrations)
   ```

3. **Start the Dev Server**:
   ```bash
   npm run dev
   ```

## 🎯 Quick Recovery Commands

### Restore to Latest (Phase 2A - Recommended)
```bash
# 1. Save current work
git stash

# 2. Go to latest checkpoint
git checkout phase-2a-complete

# 3. Reinstall dependencies (if needed)
npm install

# 4. Start dev server
npm run dev

# 5. (Optional) Return to main and restore work
git checkout main
git stash pop
```

### Restore to Phase 1B (Question Management)
```bash
git stash
git checkout phase-1b-complete
npm install
npm run dev
```

### Restore to Phase 1A (Quiz Management)
```bash
git stash
git checkout phase-1a-complete
npm install
npm run dev
```

## 📊 What's in Each Checkpoint

### Phase 2A Complete (phase-2a-complete)

**Backend:**
- Quiz attempt service (9 methods)
- Student API routes (3 endpoints)
- Bug fixes for authentication
- Role-based redirect logic

**Frontend:**
- Student dashboard with statistics
- Quiz browsing page with grid layout
- Quiz detail page with start button
- All critical bugs fixed:
  - Authentication properties corrected
  - ThemeToggle import fixed
  - Logout functionality working
  - Login redirects optimized

**Testing:**
- 48 unit tests total (100% passing)
- Manual testing completed

**Database:**
- All 6 tables with data
- Quiz attempts tracking
- Student statistics

---

### Phase 1B Complete (phase-1b-complete)

**Backend:**
- Question service (7 methods)
- Question API routes (6 endpoints)
- Question schemas

**Frontend:**
- Question management page
- Multiple choice editor (2-10 options)
- True/false editor (interactive cards)
- Short answer editor (sample + guidelines)
- Drag-and-drop reordering
- Quiz preview modal

**Testing:**
- 30 unit tests total (100% passing)

**Database:**
- Questions table populated
- Answer options table working
- Reordering support

---

### Phase 1A Complete (phase-1a-complete)

**Backend:**
- Quiz service (12 methods)
- Quiz API routes (4 endpoints)
- Quiz schemas

**Frontend:**
- Quiz list with search/filter/sort
- Create quiz form
- Edit quiz form
- Quiz detail page
- Publish/unpublish functionality

**Testing:**
- 12 unit tests (100% passing)

**Database:**
- All 6 tables created
- Users and quizzes populated

---

## 🔧 After Restoring

Once you've restored a checkpoint, you may need to:

1. **Reinstall Dependencies** (if package.json changed):
   ```bash
   npm install
   ```

2. **Check Database** (should be preserved):
   ```bash
   # Check tables
   npx wrangler d1 execute quizmakerDatabase --local --command "SELECT name FROM sqlite_master WHERE type='table';"
   
   # If empty, reapply migrations:
   npx wrangler d1 migrations apply quizmakerDatabase --local
   ```

3. **Start the Dev Server**:
   ```bash
   npm run dev
   ```

4. **Run Tests** (optional):
   ```bash
   npm test
   ```

## 📈 Checkpoint Comparison

| Checkpoint | Lines of Code | Files | Tests | Features |
|------------|---------------|-------|-------|----------|
| Phase 2A | ~19,100 | 56 | 48 | Students can browse & start quizzes |
| Phase 1B | ~9,000 | 40 | 30 | Instructors can manage questions |
| Phase 1A | ~3,500 | 20 | 12 | Instructors can manage quizzes |

## 🔎 Compare Checkpoints

```bash
# See what changed between Phase 1A and 1B
git diff phase-1a-complete phase-1b-complete --stat

# See what changed between Phase 1B and 2A
git diff phase-1b-complete phase-2a-complete --stat

# See what changed between Phase 1A and 2A
git diff phase-1a-complete phase-2a-complete --stat
```

## 🆘 Troubleshooting

### If dev server won't start:
```bash
# Clean install
rm -rf node_modules
npm install
npm run dev

# Or on Windows
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### If database is missing:
```bash
# Check if database exists
npx wrangler d1 execute quizmakerDatabase --local --command "SELECT name FROM sqlite_master WHERE type='table';"

# Reapply all migrations
npx wrangler d1 migrations apply quizmakerDatabase --local
```

### If you see auth errors:
- Phase 2A has bug fixes for authentication
- Make sure you're on the latest checkpoint
- Clear browser cookies and try again

### If pages redirect unexpectedly:
- This was fixed in Phase 2A
- Make sure you're on `phase-2a-complete` tag
- Run `git checkout phase-2a-complete`

## 💡 Tips

- Always commit your work before restoring checkpoints
- Use `git stash` for temporary saves
- Create backup branches for experimentation
- Tag important working states regularly
- Document what each checkpoint contains
- **Use `phase-2a-complete` for the most stable version**
- Test after restoring to ensure everything works

## 🎓 Which Checkpoint Should I Use?

**Use Phase 2A if you want:**
- Complete student interface
- Quiz browsing and starting
- All bugs fixed
- Most up-to-date version
- **Recommended for new work**

**Use Phase 1B if you want:**
- Just instructor features
- Question management
- No student interface yet
- Clean state before student work

**Use Phase 1A if you want:**
- Minimal quiz management only
- No questions yet
- Earliest working state
- Foundation only

---

**Created**: December 26, 2025  
**Last Updated**: December 28, 2025  
**Latest Checkpoint**: `phase-2a-complete`  
**Total Checkpoints**: 3 (phase-1a, phase-1b, phase-2a)

