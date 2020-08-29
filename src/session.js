const inquirer = require('inquirer');
const { post, put } = require('./api');

async function create() {
  const { email, password } = await inquirer.prompt([
    { message: 'Productive.io email', name: 'email', type: 'text' },
    { message: 'Productive.io password', name: 'password', type: 'password' },
  ]);

  const session = await post(
    'sessions?include=user',
    { data: { attributes: { email, password }, type: 'sessions' } },
    { 'Content-Type': 'application/vnd.api+json' }
  );

  if (!session.data) {
    console.log('Something went wrong... Check your login credentials!');
    s;
    return null;
  }

  // check if 2FA is enabled
  if (session.included[0].attributes.two_factor_auth) {
    console.log('Seems like you have 2FA enabled. Please enter your 2FA code!');
    const { otp } = await inquirer.prompt([
      { type: 'input', message: '2FA code', name: 'otp', type: 'text' },
    ]);

    const sessionWith2FA = await put(
      `sessions/${session.data.id}/validate_otp`,
      {
        data: {
          attributes: { otp, password },
          relationships: { user: session.data.relationships.user },
          type: 'sessions',
        },
      },
      { 'Content-Type': 'application/vnd.api+json' }
    );

    if (!sessionWith2FA.data) {
      console.log('Something went wrong... Check your login credentials!');
      return null;
    }
  }

  return { token: session.data.attributes.token, sessionId: session.data.id };
}

module.exports = { create };
