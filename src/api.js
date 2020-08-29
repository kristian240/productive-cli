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

  static async put(path, data, headers) {
    const res = await fetch(`https://api.productive.io/api/v2/${path}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    });
    return res.json();
  }

  static async fetchRemotePacakge() {
    const res = await fetch('https://raw.githubusercontent.com/andreicek/productive-cli/master/package.json');
    return res.json();
  }

  /**
    Function that search the included data in the response.
    It can search only by type (returns first one that maches)
    or it can search by type and id
  */
  static findInInluded(included, type, id) {
    return included.find((i) =>
      typeof id === 'undefined' ? type === i.type : id === i.id && type === i.type
    );
  }
}

module.exports = Api;
