const fs = require('fs');
const { promisify } = require('util');
const inquirer = require('inquirer');
const Api = require('./api');
const packageJson = require('../package.json');
const Logger = require('./logger');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class Config {
  static async findDeal(search, headers, today) {
    const matchingDeal = await Api.get(
      `deals?filter[query]=${search}&filter[date][lt_eq]=${today}&filter[end_date][gt_eq]=${today}`,
      headers
    );

    return matchingDeal.data.map((d) => ({
      value: { dealId: d.id, projectId: d.relationships.project.data.id },
      name: `${d.attributes.name} ${d.attributes.date}`,
    }));
  }

  static async findService(dealId, headers) {
    const matchingService = await Api.get(`services?filter[deal_id]=${dealId}`, headers);
    return matchingService.data.map((d) => ({
      value: d.id,
      name: d.attributes.name,
    }));
  }

  static async createConfig() {
    const { token } = await inquirer.prompt([
      {
        message: 'Productive.io token',
        name: 'token',
        type: 'password',
      },
    ]);

    const org = await Api.get('organization_memberships', {
      'Content-Type': 'application/vnd.api+json',
      'X-Auth-Token': token,
    });

    if (!org.data) {
      Logger.Log('Something went wrong... Check your token!');
      return;
    }

    return {
      token,
      orgId: org.data[0].relationships.organization.data.id,
      userId: org.data[0].relationships.person.data.id,
      services: [],
    };
  }

  static async getConfig(configPath) {
    try {
      const file = await readFile(configPath, { encoding: 'utf-8' });
      const config = JSON.parse(file);

      return config;
    } catch (e) {
      return null;
    }
  }

  static async createNewProjectEntry(today, headers, configPath, config) {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        message: 'Search for a project by name',
        name: 'query',
      },
    ]);
    const deals = await Config.findDeal(query, headers, today);

    const {
      deal: { dealId, projectId },
    } = await inquirer.prompt([
      {
        type: 'list',
        message: 'Select a project',
        name: 'deal',
        choices: deals,
      },
    ]);

    const services = await Config.findService(dealId, headers);
    const { serviceId } = await inquirer.prompt([
      {
        type: 'list',
        message: 'Select a service',
        name: 'serviceId',
        choices: services,
      },
    ]);

    const newConfig = {
      ...config,
      services: [
        ...(config.services || []),
        {
          serviceId,
          serviceName: services.find((s) => s.value === serviceId).name,
          dealName: deals.find((d) => d.value === dealId).name,
          projectId,
        },
      ],
    };

    await writeFile(configPath, JSON.stringify(newConfig));
  }

  static async initConfig(configPath) {
    try {
      const initConfig = await Config.createConfig();
      await writeFile(configPath, JSON.stringify(initConfig));
    } catch (e) {
      return null;
    }
  }

  static async detectNewVersion() {
    const remote = await Api.fetchRemotePacakge();

    if (remote.version === packageJson.version) {
      return;
    }

    let alert = `New version \x1b[31m${remote.version}\x1b[0m is out!\n`;
    alert += 'Run \x1b[33mnpm install -g andreicek/productive-cli\x1b[0m';
    Logger.BoxPrint(alert);
  }
}

module.exports = Config;
