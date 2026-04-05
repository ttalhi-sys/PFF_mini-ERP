const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jgzxaltppeudjdgtdmya.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnenhhbHRwcGV1ZGpkZ3RkbXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDkxNTcsImV4cCI6MjA4ODM4NTE1N30.kGs-X1cs6UlWhj4mnbupe9HbJijLBuFq4RLC9AatCxM'
);

async function testConnection() {
    console.log('Testing Supabase connection...');
    const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    } else {
        console.log('Connected successfully! Categories count:', count || 0);
    }
}

testConnection();
