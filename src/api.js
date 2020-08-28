const fetch = require('node-fetch').default;

class Api {
  static async get(path, headers) {
    const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
      method: 'GET',
      headers,
    });
    return res.json();
  }

  static async post(path, data, headers) {
    const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });
    return res.json();
  }

  static async patch(path, data, headers) {
    const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers,
    });
    return res.json();
  }

  static async fetchRemotePacakge() {
    const res = await fetch('https://raw.githubusercontent.com/andreicek/productive-cli/master/package.json');
    return res.json();
  }
}

module.exports = Api;
