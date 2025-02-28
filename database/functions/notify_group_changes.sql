CREATE OR REPLACE FUNCTION notify_group_changes()
RETURNS TRIGGER AS $$
DECLARE
    affected_users UUID[];
    payload JSON;
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Ensure array is never NULL
        SELECT COALESCE(ARRAY_AGG(user_id), ARRAY[]::UUID[]) INTO affected_users
        FROM account_schedule_groups
        WHERE group_id = OLD.group_id;

        -- 🔹 Only loop if the array is NOT empty
        IF array_length(affected_users, 1) IS NOT NULL THEN
            FOR i IN 1..array_length(affected_users, 1) LOOP
                payload := json_build_object(
                    'user_id', affected_users[i],
                    'group_id', OLD.group_id
                );
                PERFORM pg_notify('group_changes', payload::text);
            END LOOP;
        END IF;

    ELSIF TG_OP = 'INSERT' THEN
        -- Notify when a user is added to a group
        payload := json_build_object(
            'user_id', NEW.user_id,
            'group_id', NEW.group_id
        );
        PERFORM pg_notify('group_changes', payload::text);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;