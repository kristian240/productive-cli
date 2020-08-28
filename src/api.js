const fetch = require('node-fetch').default;

async function get(path, headers) {
  const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
    method: 'GET',
    headers,
  });
  return await res.json();
}

async function post(path, data, headers) {
  const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers,
  });
  return await res.json();
}

async function patch(path, data, headers) {
  const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers,
  });
  return await res.json();
}

async function put(path, data, headers) {
  const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers,
  });
  return await res.json();
}

async function fetchRemotePacakge() {
  const res = await fetch(
    'https://raw.githubusercontent.com/andreicek/productive-cli/master/package.json'
  );
  return await res.json();
}

module.exports = {
  get,
  post,
  patch,
  put,
  fetchRemotePacakge,
};
