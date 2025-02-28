CREATE OR REPLACE FUNCTION notify_group_deletion()
RETURNS TRIGGER AS $$
DECLARE
    affected_users UUID[];
    payload JSON;
BEGIN
    -- Get affected users BEFORE deleting the group
    SELECT COALESCE(ARRAY_AGG(user_id), ARRAY[]::UUID[]) INTO affected_users
    FROM account_schedule_groups
    WHERE group_id = OLD.group_id;

    -- Notify Fastify for each affected user
    IF array_length(affected_users, 1) IS NOT NULL THEN
        FOR i IN 1..array_length(affected_users, 1) LOOP
            payload := json_build_object(
                'user_id', affected_users[i],
                'group_id', OLD.group_id
            );
            PERFORM pg_notify('group_changes', payload::text);
        END LOOP;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;