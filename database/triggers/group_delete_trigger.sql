DROP TRIGGER IF EXISTS group_delete_trigger ON schedule_groups;

CREATE TRIGGER group_delete_trigger
BEFORE DELETE ON schedule_groups
FOR EACH ROW
EXECUTE FUNCTION notify_group_deletion();