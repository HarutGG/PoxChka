# Database Setup Instructions

## Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **sfjrkxmoqjruhmflqjwo**
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `docs/database.sql`
6. Click **Run** or press `Ctrl+Enter`

This will create:
- `profiles` table (user profiles)
- `transactions` table (financial transactions)
- Row Level Security (RLS) policies
- Automatic profile creation trigger

## Step 2: Verify Tables

1. Go to **Table Editor** (left sidebar)
2. You should see two tables:
   - `profiles`
   - `transactions`

## Step 3: Test the Application

1. Log in with Google
2. Add a transaction
3. Refresh the page
4. Your transactions should persist!

## Troubleshooting

### "Permission denied" errors
- Make sure RLS policies are enabled
- Check that you're logged in
- Verify the SQL script ran successfully

### Transactions not saving
- Check browser console for errors
- Verify Supabase environment variables in Vercel
- Check Supabase logs in Dashboard → Logs

### Session lost on refresh
- Verify proxy.ts is working
- Check that cookies are enabled in browser
- Ensure Supabase redirect URLs are configured correctly
