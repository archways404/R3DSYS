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