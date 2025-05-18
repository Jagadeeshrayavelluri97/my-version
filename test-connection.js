const axios = require('axios');

// Test backend connection
async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get('http://localhost:5000');
    console.log('Backend connection successful!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Backend connection failed!');
    console.error('Error:', error.message);
    return false;
  }
}

// Test API endpoint
async function testApiEndpoint() {
  try {
    console.log('\nTesting API endpoint...');
    const response = await axios.get('http://localhost:5000/api/v1/debug');
    console.log('API endpoint test successful!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('API endpoint test failed!');
    console.error('Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const backendConnected = await testBackendConnection();
  if (backendConnected) {
    await testApiEndpoint();
  }
  
  console.log('\nTest Summary:');
  console.log('- Backend Connection:', backendConnected ? 'SUCCESS' : 'FAILED');
  
  console.log('\nIf tests failed, make sure:');
  console.log('1. Backend server is running on port 5000');
  console.log('2. CORS is properly configured');
  console.log('3. API endpoints are working correctly');
}

runTests();
