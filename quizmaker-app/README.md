# QuizMaker Application

A modern, full-stack quiz-based application built with Next.js 15, Cloudflare Workers, and D1 database. Supports both students and instructors with role-based dashboards and secure authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

## ✨ Features

- ✅ **User Authentication** - Secure login and registration with password hashing
- ✅ **Role-Based Access** - Separate experiences for students and instructors
- ✅ **Dashboard** - Personalized dashboards for each user type
- ✅ **Database Integration** - Cloudflare D1 (SQLite) database with migrations
- ✅ **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- ✅ **Production Ready** - Deployable to Cloudflare Workers

## 📚 Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Quick reference and testing guide
- **[docs/TECHNICAL_PRD.md](./docs/TECHNICAL_PRD.md)** - Comprehensive technical documentation
- **[docs/IMPLEMENTATION_README.md](./docs/IMPLEMENTATION_README.md)** - Detailed implementation guide

## 🎯 User Roles

### Student
- View available quizzes
- Take quizzes (coming soon)
- Track performance and progress

### Instructor
- Create and manage quizzes (coming soon)
- View student results
- Generate analytics

## 🛠️ Technology Stack

- **Framework:** Next.js 15.5.9 with App Router
- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **UI:** shadcn/ui + Tailwind CSS 4
- **Authentication:** Cookie-based with PBKDF2 password hashing
- **Language:** TypeScript 5

## 📦 Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview on Cloudflare runtime

# Deployment
npm run deploy           # Deploy to Cloudflare Workers
npm run upload           # Build and upload to Cloudflare

# Database
npx wrangler d1 migrations apply quizmakerDatabase --local   # Apply migrations locally
npx wrangler d1 migrations list quizmakerDatabase            # List migrations

# Utilities
npm run lint             # Run ESLint
npm run cf-typegen       # Generate Cloudflare TypeScript types
```

## 🗄️ Database Schema

The application includes 6 database tables:

1. **users** - User accounts (students and instructors)
2. **quizzes** - Quiz metadata and settings
3. **questions** - Quiz questions
4. **answer_options** - Answer choices for questions
5. **quiz_attempts** - Student quiz attempts
6. **student_answers** - Individual question answers

All migrations are located in the `migrations/` directory.

## 🔐 Security

- Password hashing with PBKDF2 (100,000 iterations)
- HTTP-only cookies for authentication tokens
- SQL injection prevention via prepared statements
- Server-side input validation
- HMAC-SHA256 signed tokens

## 🌐 Environment Variables

Create a `.dev.vars` file for local development (already included):

```env
JWT_SECRET=your-secret-key-change-in-production
NEXTJS_ENV=development
```

For production, set secrets via Wrangler:

```bash
npx wrangler secret put JWT_SECRET
```

## 🎨 Project Structure

```
quizmaker-app/
├── src/
│   ├── app/
│   │   ├── actions/         # Server actions
│   │   ├── dashboard/       # Dashboard page
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   └── lib/
│       ├── services/        # Business logic
│       ├── auth.ts          # Authentication utilities
│       └── d1-client.ts     # Database client
├── migrations/              # Database migrations
├── docs/                    # Documentation
└── wrangler.jsonc          # Cloudflare configuration
```

## 🧪 Testing the Application

### Register a New User

1. Navigate to `http://localhost:3000`
2. Click "Register"
3. Fill out the form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - User Type: "Student" or "Instructor"
   - Password: "password123" (min 8 characters)
4. Click "Create Account"
5. You'll be redirected to the dashboard

### Login

1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Login"
4. You'll be redirected to the dashboard

## 🚀 Deployment to Cloudflare

1. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

2. **Set Production Secrets:**
   ```bash
   npx wrangler secret put JWT_SECRET
   ```

3. **Apply Migrations (Remote):**
   ```bash
   npx wrangler d1 migrations apply quizmakerDatabase --remote
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## 📊 Current Status

**✅ MVP Complete**

- [x] User authentication (register, login, logout)
- [x] Role-based dashboards (student/instructor)
- [x] Database schema and migrations
- [x] Modern UI with shadcn/ui
- [x] Production-ready build

**🚧 Coming Soon**

- [ ] Quiz creation interface (instructors)
- [ ] Quiz taking interface (students)
- [ ] Results and analytics
- [ ] Quiz scheduling

## 🐛 Troubleshooting

### Database Connection Issues

If you see "Database binding not found" errors:

1. Ensure migrations are applied: `npx wrangler d1 migrations apply quizmakerDatabase --local`
2. Regenerate types: `npm run cf-typegen`
3. Restart the dev server

### Build Errors

If the build fails:

1. Clear `.next` and `.wrangler` folders
2. Run `npm install`
3. Run `npm run cf-typegen`
4. Try building again: `npm run build`

### Authentication Issues

If you can't login:

1. Clear browser cookies
2. Check that `.dev.vars` file exists
3. Verify database migrations are applied
4. Check the console for errors

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [OpenNext.js for Cloudflare](https://opennext.js.org/cloudflare)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🤝 Contributing

This is a learning/demo project. Feel free to:

- Report issues
- Suggest features
- Submit pull requests
- Use as a template for your own projects

## 📄 License

See LICENSE file for details.

---

**Built with** ❤️ **using Next.js, Cloudflare Workers, and modern web technologies.**

For detailed documentation, see:
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Quick reference
- [docs/TECHNICAL_PRD.md](./docs/TECHNICAL_PRD.md) - Technical specifications
- [docs/IMPLEMENTATION_README.md](./docs/IMPLEMENTATION_README.md) - Implementation guide
