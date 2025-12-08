const axios = require('axios');

async function testEndpoint() {
  try {
    // Create an axios instance
    const api = axios.create({
      baseURL: 'http://localhost:8000',
      withCredentials: true
    });

    // Get CSRF cookie
    console.log('Getting CSRF cookie...');
    await api.get('/sanctum/csrf-cookie');

    // Login
    console.log('Logging in...');
    const loginResponse = await api.post('/api/login', {
      email: 'nick000@gmail.com',
      password: 'nick000password'
    });

    console.log('Login successful:', loginResponse.data);

    // Set the authorization header with the token
    api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;

    // Test conversations endpoint
    console.log('Fetching conversations...');
    const conversationsResponse = await api.get('/api/messages/conversations');
    
    console.log('Conversations response:', JSON.stringify(conversationsResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testEndpoint();