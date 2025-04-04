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