const fetch = require('node-fetch');

async function testCategoryAPI() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    console.log('Testing Category API endpoints...');
    
    // Test GET categories
    console.log('\n1. Testing GET /api/categories');
    const getResponse = await fetch(`${baseUrl}/api/categories`);
    const getResult = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getResult, null, 2));
    
    // Test POST category (without auth - should fail)
    console.log('\n2. Testing POST /api/categories (without auth)');
    const postResponse = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Category',
        description: 'A test category'
      })
    });
    const postResult = await postResponse.json();
    console.log('Status:', postResponse.status);
    console.log('Response:', JSON.stringify(postResult, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testCategoryAPI();