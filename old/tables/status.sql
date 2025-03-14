CREATE TABLE status (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    mode VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remove_at TIMESTAMP,
    visible BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);