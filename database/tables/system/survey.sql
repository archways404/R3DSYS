CREATE TABLE survey (
    id SERIAL PRIMARY KEY,
    overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
    ui_rating INT CHECK (ui_rating BETWEEN 1 AND 5),
    functionality_rating INT CHECK (functionality_rating BETWEEN 1 AND 5),
    feedback TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);