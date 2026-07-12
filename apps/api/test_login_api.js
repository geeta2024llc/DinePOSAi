async function run(email) {
  console.log('Sending login request to API for:', email);
  
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: 'Password123!',
        deviceId: 'test-device-id'
      })
    });
    
    const json = await res.json();
    console.log('Login API Response:', json);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// Pass the email of the user we just registered in previous step
run('api_signup_user_179337@test.com');
