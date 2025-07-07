DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS category;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Category Table
CREATE TABLE category (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create Task Table
CREATE TABLE task (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_name VARCHAR NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    note TEXT,
    category_id UUID REFERENCES category(category_id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create Tag Table
CREATE TABLE tag (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_description VARCHAR NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create Join Table for Many-to-Many between Task and Tag
CREATE TABLE task_tags (
    task_id UUID REFERENCES task(task_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tag(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view only their own data
CREATE POLICY "Users can view their own categories"
  ON category FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own categories"
  ON category FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own tasks"
  ON task FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own tasks"
  ON task FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own tags"
  ON tag FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own tags"
  ON tag FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own task-tag relationships"
  ON task_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM task
      WHERE task.task_id = task_tags.task_id
      AND task.user_id = auth.uid()
    )
  );
