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