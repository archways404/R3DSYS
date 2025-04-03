CREATE TABLE daily_stats (
    stat_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    account_count INTEGER NOT NULL,
    active_shift_count INTEGER NOT NULL,
    archived_shift_count INTEGER NOT NULL,
    auth_log_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);