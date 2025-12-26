-- Migration: Create quizzes table
-- Description: Table to store quiz information created by instructors

CREATE TABLE IF NOT EXISTS quizzes (
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_quizzes_instructor ON quizzes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes(is_published);

