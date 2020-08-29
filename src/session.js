const inquirer = require('inquirer');
const Api = require('./api');
const Logger = require('./logger');

class Session {
  static async create() {
    const { email, password } = await inquirer.prompt([
      {
        message: 'Productive.io email',
        name: 'email',
        type: 'text',
      },
      {
        message: 'Productive.io password',
        name: 'password',
        type: 'password',
      },
    ]);

    const session = await Api.post(
      'sessions?include=user',
      {
        data: {
          attributes: {
            email,
            password,
          },
          type: 'sessions',
        },
      },
      { 'Content-Type': 'application/vnd.api+json' }
    );

    if (!session.data) {
      Logger.Log('Something went wrong... Check your login credentials!');

      return null;
    }

    // Check if 2FA is enabled
    if (session.included[0].attributes.two_factor_auth) {
      const { otp } = await inquirer.prompt([
        {
          type: 'input',
          message: '2FA code',
          name: 'otp',
        },
      ]);

      const sessionWith2FA = await Api.put(
        `sessions/${session.data.id}/validate_otp`,
        {
          data: {
            attributes: {
              otp,
              password,
            },
            relationships: { user: session.data.relationships.user },
            type: 'sessions',
          },
        },
        { 'Content-Type': 'application/vnd.api+json' }
      );

      if (!sessionWith2FA.data) {
        Logger.Log('Something went wrong... Check your login credentials!');
        return null;
      }
    }

    return {
      token: session.data.attributes.token,
      sessionId: session.data.id,
    };
  }
}

module.exports = Session;
