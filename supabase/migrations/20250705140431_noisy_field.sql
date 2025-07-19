/*
  # Demo User Creation Instructions

  This file contains instructions for creating a demo user manually through the Supabase dashboard.
  
  ## Steps to create a demo user:
  
  1. Go to your Supabase project dashboard
  2. Navigate to Authentication > Users
  3. Click "Add user" 
  4. Enter the following details:
     - Email: demo@autiscope.com
     - Password: password123
     - Email Confirm: true (check this box)
  5. Click "Create user"
  
  The profile will be automatically created via the database trigger.
  
  ## Alternative: Create via SQL (if you have direct database access)
  
  You can also create the demo user directly in the database, but this is more complex
  and requires careful handling of password hashing and email confirmation.
  
  ## Note:
  The demo credentials have been removed from the login page to encourage
  users to create their own accounts, which is more secure and provides
  a better user experience.
*/

-- This is a documentation file only - no SQL commands to execute
SELECT 'Demo user creation instructions - see comments above' as instructions;