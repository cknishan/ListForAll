DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS category;

-- Ensure UUID extension is enabled for user references
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Category Table (linked to profiles)
CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create Task Table (linked to categories and profiles)
CREATE TABLE IF NOT EXISTS task (
    task_id SERIAL PRIMARY KEY,
    task_name VARCHAR NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    note TEXT,
    category_id INT REFERENCES category(category_id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create Tag Table (linked to profiles)
CREATE TABLE IF NOT EXISTS tag (
    tag_id SERIAL PRIMARY KEY,
    tag_description VARCHAR NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create Task_Tags Table (Many-to-Many Relationship between Task and Tag)
CREATE TABLE IF NOT EXISTS task_tags (
    task_id INT REFERENCES task(task_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tag(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Enable RLS for all new tables
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Users can see only their own categories
CREATE POLICY "Users can view their own categories." 
ON category 
FOR SELECT USING (user_id = auth.uid());

-- Users can insert/update/delete only their own categories
CREATE POLICY "Users can manage their own categories." 
ON category 
FOR ALL USING (user_id = auth.uid());

-- Users can see only their own tasks
CREATE POLICY "Users can view their own tasks." 
ON task 
FOR SELECT USING (user_id = auth.uid());

-- Users can manage their own tasks
CREATE POLICY "Users can manage their own tasks." 
ON task 
FOR ALL USING (user_id = auth.uid());

-- Users can view only their own tags
CREATE POLICY "Users can view their own tags." 
ON tag 
FOR SELECT USING (user_id = auth.uid());

-- Users can manage their own tags
CREATE POLICY "Users can manage their own tags." 
ON tag 
FOR ALL USING (user_id = auth.uid());

-- Users can only manage task-tag relationships for their own tasks
CREATE POLICY "Users can manage their own task tags."
ON task_tags
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM task 
        WHERE task.task_id = task_tags.task_id 
        AND task.user_id = auth.uid()
    )
);
