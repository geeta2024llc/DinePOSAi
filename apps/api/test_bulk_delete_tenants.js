import http from 'http';

async function testBulkDeleteEndpoint() {
  console.log('Testing POST /api/admin/tenants/bulk-delete schema validation...');
  
  const payload = JSON.stringify({ ids: [] });

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/tenants/bulk-delete',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log(`HTTP Status Code: ${res.statusCode}`);
      try {
        const json = JSON.parse(body);
        console.log('Response:', json);
      } catch (e) {
        console.log('Raw body:', body);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`Request error: ${err.message}`);
  });

  req.write(payload);
  req.end();
}

testBulkDeleteEndpoint();
