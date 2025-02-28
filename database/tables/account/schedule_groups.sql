CREATE TABLE schedule_groups (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique ID for each schedule group
    name VARCHAR(255) NOT NULL,                           -- Name of the schedule group
    description VARCHAR(255)                              -- Optional description of the group
);


ALTER TABLE account_schedule_groups
ADD CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE;