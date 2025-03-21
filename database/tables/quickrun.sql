-- 1. Independent Tables
CREATE TABLE account (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    notification_email VARCHAR(255) NOT NULL,
    teams_email VARCHAR(255),
    recovery_key VARCHAR(255) UNIQUE,
    role VARCHAR(255) NOT NULL
);

CREATE TABLE schedule_groups (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE shift_types (
    shift_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_long VARCHAR(255) NOT NULL,
    name_short VARCHAR(100) NOT NULL
);

-- 2. Tables referencing only the above
CREATE TABLE account_lockout (
    lockout_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    failed_attempts INT DEFAULT 0 NOT NULL,
    last_failed_ip VARCHAR(45),
    locked BOOLEAN DEFAULT FALSE NOT NULL,
    unlock_time TIMESTAMP,
    last_failed_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE
);

CREATE TABLE account_schedule_groups (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE,
    UNIQUE (user_id, group_id)
);

CREATE TABLE auth_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    ip_address VARCHAR(45) NOT NULL,
    fingerprint VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    error_message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE general_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    action_type VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    error_message VARCHAR(255),
    creation_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tables referencing account, schedule_groups, shift_types
CREATE TABLE active_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_type_id UUID NOT NULL,
    assigned_to UUID,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    schedule_group_id UUID NOT NULL,
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES account(user_id) ON DELETE SET NULL,
    FOREIGN KEY (schedule_group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE archived_shifts (
    shift_id UUID PRIMARY KEY,
    assigned_to UUID,
    shift_type_id UUID NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    schedule_group_id UUID NOT NULL,
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

-- 4. Templates + Meta
CREATE TABLE template_meta (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    private BOOLEAN DEFAULT FALSE NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES account(user_id) ON DELETE CASCADE
);

CREATE TABLE templates (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL,
    shift_type_id UUID NOT NULL,
    weekday INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (template_id) REFERENCES template_meta(template_id) ON DELETE CASCADE,
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE
);

-- 5. Shift Removal Requests (depends on active_shifts and account)
CREATE TABLE shift_removal_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL,
    user_id UUID NOT NULL,
    requested_by UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID,
    approval_time TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES active_shifts(shift_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES account(user_id) ON DELETE SET NULL
);

-- 6. Server Status & Messages & Survey (no FK dependencies)
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