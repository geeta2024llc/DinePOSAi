fetch('http://localhost:4000/health')
  .then(res => res.json())
  .then(json => console.log('API health check:', json))
  .catch(err => console.error('API health check failed:', err));
