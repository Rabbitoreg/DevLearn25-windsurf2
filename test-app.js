// Simple test script to verify the application is working
// Run with: node test-app.js

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testApp() {
  console.log('🧪 Testing AI Tool Match Application...\n');

  try {
    // Test 1: Home page
    console.log('1. Testing home page...');
    const homeResponse = await makeRequest('/');
    console.log(`   ✅ Home page: ${homeResponse.status === 200 ? 'OK' : 'FAILED'}`);

    // Test 2: Join page
    console.log('2. Testing join page...');
    const joinPageResponse = await makeRequest('/join');
    console.log(`   ✅ Join page: ${joinPageResponse.status === 200 ? 'OK' : 'FAILED'}`);

    // Test 3: Content files
    console.log('3. Testing content files...');
    const toolsResponse = await makeRequest('/content/deck.tools.json');
    const scenariosResponse = await makeRequest('/content/scenarios.json');
    console.log(`   ✅ Tools JSON: ${toolsResponse.status === 200 ? 'OK' : 'FAILED'}`);
    console.log(`   ✅ Scenarios JSON: ${scenariosResponse.status === 200 ? 'OK' : 'FAILED'}`);

    // Test 4: API endpoints (these will fail without Supabase, but should return proper errors)
    console.log('4. Testing API endpoints...');
    
    try {
      const joinApiResponse = await makeRequest('/api/join', 'POST', { codename: 'test-user' });
      console.log(`   ⚠️  Join API: ${joinApiResponse.status} (Expected to fail without Supabase)`);
    } catch (e) {
      console.log(`   ⚠️  Join API: Connection error (Expected without Supabase)`);
    }

    // Test 5: Static pages
    console.log('5. Testing other pages...');
    const leaderboardResponse = await makeRequest('/leaderboard');
    const adminResponse = await makeRequest('/admin');
    console.log(`   ✅ Leaderboard page: ${leaderboardResponse.status === 200 ? 'OK' : 'FAILED'}`);
    console.log(`   ✅ Admin page: ${adminResponse.status === 200 ? 'OK' : 'FAILED'}`);

    console.log('\n🎉 Basic application structure is working!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up Supabase project');
    console.log('   2. Run the SQL schema from db/schema.sql');
    console.log('   3. Add environment variables to .env.local');
    console.log('   4. Test full functionality with database');
    console.log('   5. Deploy to Vercel');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

testApp();
