import http from 'http';

async function testPublicMenuEndpoint() {
  console.log('Testing GET /api/menu/public...');
  
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/menu/public',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      try {
        const json = JSON.parse(body);
        console.log('Success:', json.success);
        if (json.data) {
          console.log('Tenant ID:', json.data.tenantId);
          console.log('Restaurant Name:', json.data.branding?.restaurantName);
          console.log('Categories Count:', json.data.categories?.length || 0);
          console.log('Items Count:', json.data.items?.length || 0);
          console.log('First Item:', json.data.items?.[0]?.name);
        }
      } catch (err) {
        console.error('Response non-JSON:', body);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

testPublicMenuEndpoint();
