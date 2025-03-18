CREATE TABLE account (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
	notification_email VARCHAR(255) NOT NULL,
    recovery_key VARCHAR(255) UNIQUE,
    role VARCHAR(255) NOT NULL
);

CREATE TABLE account_lockout (
    lockout_id SERIAL PRIMARY KEY,                                       -- Unique ID for each lockout record
    user_id UUID NOT NULL UNIQUE,                                        -- Unique constraint on user_id
    failed_attempts INT DEFAULT 0 NOT NULL,                              -- Number of failed login attempts
    last_failed_ip VARCHAR(45),                                          -- Last IP address for failed login
    locked BOOLEAN DEFAULT FALSE NOT NULL,                               -- Indicates whether the account is locked
    unlock_time TIMESTAMP,                                               -- Time when the account will be unlocked
    last_failed_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                -- Timestamp of the last failed login attempt
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE  -- Ensures lockout records are removed if a user is deleted
);

CREATE TABLE account_schedule_groups (
    id SERIAL PRIMARY KEY,                                -- Unique ID for each association
    user_id UUID NOT NULL,                                -- References the user account
    group_id UUID NOT NULL,                               -- References the schedule group
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE,
    UNIQUE (user_id, group_id)                            -- Prevent duplicate entries
);


CREATE TABLE schedule_groups (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique ID for each schedule group
    name VARCHAR(255) NOT NULL,                           -- Name of the schedule group
    description VARCHAR(255)                              -- Optional description of the group
);

ALTER TABLE account_schedule_groups
ADD CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE;

CREATE TABLE auth_logs (
    log_id BIGSERIAL PRIMARY KEY,                   -- Unique log ID
    user_id UUID,                                   -- UUID of the account attempting to log in
    ip_address VARCHAR(45) NOT NULL,                -- IP address of the login attempt
    fingerprint VARCHAR(255) NOT NULL,              -- Device/browser fingerprint
    success BOOLEAN NOT NULL,                       -- Indicates whether the login attempt was successful
    error_message VARCHAR(255),                     -- Error message if login failed (e.g., "wrong password")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the login attempt
);

CREATE TABLE general_logs (
    log_id BIGSERIAL PRIMARY KEY,                   -- Unique log ID
    user_id UUID,                                   -- UUID of the user performing the action
    action_type VARCHAR(100) NOT NULL,              -- Type of action (e.g., "CREATE", "UPDATE", "DELETE")
    success BOOLEAN NOT NULL,                       -- Indicates whether the action was successful
    error_message VARCHAR(255),                     -- Error message if the action failed
    creation_method VARCHAR(50) NOT NULL,           -- "trigger" or "manual"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the action was logged
);

CREATE TABLE active_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique ID for each active shift
    shift_type_id UUID NOT NULL,                          -- References the type of the shift
    assigned_to UUID,                                     -- References the user assigned to the shift
    start_time TIME NOT NULL,                             -- Start time of the shift
    end_time TIME NOT NULL,                               -- End time of the shift
    date DATE NOT NULL,                                   -- Date of the shift
    description TEXT,                                     -- Description of the shift (new column)
    schedule_group_id UUID NOT NULL,                      -- References the schedule group for this shift
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES account(user_id) ON DELETE SET NULL,
    FOREIGN KEY (schedule_group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE archived_shifts (
    shift_id UUID PRIMARY KEY,                            -- Unique ID for each archived shift
    assigned_to UUID,                                     -- References the user assigned to the shift
    shift_type_id UUID NOT NULL,                          -- References the type of the shift
    start_time TIME NOT NULL,                             -- Start time of the shift
    end_time TIME NOT NULL,                               -- End time of the shift
    date DATE NOT NULL,                                   -- Date of the shift
    schedule_group_id UUID NOT NULL,                      -- References the schedule group for this shift
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES account(user_id) ON DELETE SET NULL,
    FOREIGN KEY (schedule_group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE available_for_shift (
    id BIGSERIAL PRIMARY KEY,
    shift_id UUID NOT NULL,
    user_id UUID NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES active_shifts(shift_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE
);

CREATE TABLE shift_trades (
    trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    req_user_id UUID NOT NULL,
    rec_user_id UUID NOT NULL,
    shift_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (req_user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (rec_user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES active_shifts(shift_id) ON DELETE CASCADE
);

CREATE TABLE shift_types (
    shift_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_long VARCHAR(255) NOT NULL,
    name_short VARCHAR(100) NOT NULL
);

CREATE TABLE server_status (
    id SERIAL PRIMARY KEY,
    is_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    display_survey BOOLEAN NOT NULL DEFAULT FALSE,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_messages (
    id SERIAL PRIMARY KEY,
    display BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    message_type TEXT CHECK (message_type IN ('information', 'warning', 'error', 'note')),
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT,
    message TEXT NOT NULL
);

CREATE TABLE survey (
    id SERIAL PRIMARY KEY,
    overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
    ui_rating INT CHECK (ui_rating BETWEEN 1 AND 5),
    functionality_rating INT CHECK (functionality_rating BETWEEN 1 AND 5),
    feedback TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE template_meta (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    private BOOLEAN DEFAULT FALSE NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES account(user_id) ON DELETE CASCADE
);

CREATE TABLE templates (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for each shift
    template_id UUID NOT NULL,                            -- References template_meta
    shift_type_id UUID NOT NULL,                          -- References shift_types
    weekday INT NOT NULL,                                 -- Day of the week (0 = Sunday, 1 = Monday, ...)
    start_time TIME NOT NULL,                             -- Shift start time
    end_time TIME NOT NULL,                               -- Shift end time
    FOREIGN KEY (template_id) REFERENCES template_meta(template_id) ON DELETE CASCADE, -- Deletes shifts if the template is deleted
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE -- Deletes shifts if the shift type is deleted
);

CREATE TABLE shift_removal_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique request ID
    shift_id UUID NOT NULL,                               -- References the shift to be modified
    user_id UUID NOT NULL,                                -- User being removed from the shift
    requested_by UUID NOT NULL,                           -- Who requested the removal
    status VARCHAR(50) NOT NULL DEFAULT 'pending',        -- Status: 'pending', 'approved', 'rejected'
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Timestamp when the request was made
    approved_by UUID,                                     -- Admin who approves/rejects (NULL until approved/rejected)
    approval_time TIMESTAMP,                              -- Timestamp of approval/rejection (NULL until processed)
    FOREIGN KEY (shift_id) REFERENCES active_shifts(shift_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES account(user_id) ON DELETE SET NULL
);



