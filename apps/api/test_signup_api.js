async function run() {
  const email = 'api_signup_user_' + Math.floor(Math.random() * 1000000) + '@test.com';
  console.log('Sending signup request to API for:', email);
  
  try {
    const res = await fetch('http://localhost:4000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName: 'API Test Restaurant',
        name: 'API Test Admin',
        email: email,
        password: 'Password123!',
        country: 'Japan'
      })
    });
    
    const json = await res.json();
    console.log('Signup API Response:', json);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
