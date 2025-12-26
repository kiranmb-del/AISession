-- Migration: Create answer_options table
-- Description: Table to store answer options for multiple choice and true/false questions

CREATE TABLE IF NOT EXISTS answer_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_answer_options_question ON answer_options(question_id);

