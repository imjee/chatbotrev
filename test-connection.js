require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('\n=== Testing Supabase Connection ===\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('Supabase URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
  console.log('Service Role Key:', serviceRoleKey ? '✓ Found' : '✗ Missing');
  console.log('Anon Key:', anonKey ? '✓ Found' : '✗ Missing');
  console.log();

  if (!serviceRoleKey) {
    console.log('ERROR: SUPABASE_SERVICE_ROLE_KEY not found!');
    console.log('Please add it to Replit Secrets.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log('Testing database access...');

    // Test: Read from users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('✗ Database access FAILED:', error.message);
      process.exit(1);
    }

    console.log('✓ Database access successful!');
    console.log();

    // Test: Insert a test user
    console.log('Testing insert...');
    const testId = 'test_' + Date.now();
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        telegram_id: testId,
        username: 'test_user',
        first_name: 'Test'
      });

    if (insertError) {
      console.log('✗ Insert FAILED:', insertError.message);
      process.exit(1);
    }

    console.log('✓ Insert successful!');

    // Clean up
    await supabase.from('users').delete().eq('telegram_id', testId);

    console.log('\n=== All tests passed! ===\n');
    console.log('Bot is ready to run with service role key.');

  } catch (err) {
    console.log('✗ Unexpected error:', err.message);
    process.exit(1);
  }
}

testConnection();
