DROP TRIGGER IF EXISTS group_insert_trigger ON account_schedule_groups;
CREATE TRIGGER group_insert_trigger
AFTER INSERT ON account_schedule_groups
FOR EACH ROW
EXECUTE FUNCTION notify_group_changes();