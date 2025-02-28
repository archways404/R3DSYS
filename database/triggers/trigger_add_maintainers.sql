CREATE TRIGGER trigger_add_maintainers
AFTER INSERT ON schedule_groups
FOR EACH ROW
EXECUTE FUNCTION add_maintainers_to_group();