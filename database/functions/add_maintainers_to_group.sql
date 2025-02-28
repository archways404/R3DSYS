CREATE OR REPLACE FUNCTION add_maintainers_to_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO account_schedule_groups (user_id, group_id)
    SELECT user_id, NEW.group_id
    FROM account
    WHERE role = 'maintainer';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;