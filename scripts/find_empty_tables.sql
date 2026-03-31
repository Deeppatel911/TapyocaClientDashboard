-- Find all empty tables in your database
SELECT 
  schemaname,
  tablename,
  n_tup_ins - n_tup_del AS row_count
FROM pg_stat_user_tables 
WHERE n_tup_ins - n_tup_del = 0
ORDER BY tablename;

-- Also check what tables exist and their structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
