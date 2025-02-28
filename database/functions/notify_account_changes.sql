-- Step 1: Create the NOTIFY function
CREATE OR REPLACE FUNCTION notify_account_changes()
RETURNS TRIGGER AS $$
DECLARE
    payload JSON;
BEGIN
    -- Construct a JSON payload with user_id and email
    payload := json_build_object(
        'user_id', NEW.user_id,
        'email', NEW.email
    );

    -- Notify the Fastify server with the payload
    PERFORM pg_notify('account_changes', payload::text);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;