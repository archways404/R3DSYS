-- Load extension if not already installed
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily stats insert
SELECT cron.schedule(
  'nightly_stats',
  '0 2 * * *',
  $$
  INSERT INTO daily_stats (stat_date, account_count, active_shift_count, archived_shift_count, auth_log_count)
  SELECT
      CURRENT_DATE,
      (SELECT COUNT(*) FROM account),
      (SELECT COUNT(*) FROM active_shifts),
      (SELECT COUNT(*) FROM archived_shifts),
      (SELECT COUNT(*) FROM auth_logs)
  ON CONFLICT (stat_date)
  DO UPDATE SET
      account_count = EXCLUDED.account_count,
      active_shift_count = EXCLUDED.active_shift_count,
      archived_shift_count = EXCLUDED.archived_shift_count,
      auth_log_count = EXCLUDED.auth_log_count,
      created_at = CURRENT_TIMESTAMP;
  $$
);


-- SELECT * FROM cron.job;

-- SELECT cron.unschedule('nightly_stats');