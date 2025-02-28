-- Step 2: Create the Trigger on the account table
CREATE TRIGGER account_update_trigger
AFTER UPDATE ON account
FOR EACH ROW
EXECUTE FUNCTION notify_account_changes();