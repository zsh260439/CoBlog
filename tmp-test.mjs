fetch('https://ipwho.is/58.48.47.210')
  .then(function(r) { return r.json() })
  .then(function(d) { console.log('RESULT:', d.region, d.city) })
  .catch(function(e) { console.error('FETCH ERROR:', e.message) })
