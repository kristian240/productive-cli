const homedir = require('os').homedir();
const { format } = require('date-fns');
const inquirer = require('inquirer');

const Timer = require('./timer');
const TimeEntry = require('./time-entry');
const Config = require('./config');
const Reports = require('./reports');
const Logger = require('./logger');

const CONFIG_PATH = `${homedir}/.productivecli`;

(async () => {
  await Config.detectNewVersion();
  const today = format(new Date(), 'yyyy-MM-dd');

  const config = await Config.getConfig(CONFIG_PATH);

  if (!config) {
    Logger.BoxPrint('This is your first run so we need to log you in first!');

    await Config.initConfig(CONFIG_PATH);

    Logger.Log('Awesome! Now run productive-cli config to get started!');
    return;
  }

  const headers = {
    'Content-Type': 'application/vnd.api+json',
    'X-Auth-Token': config.token,
    'X-Organization-Id': config.orgId,
  };

  // eslint-disable-next-line no-unused-expressions
  require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('config', 'Add new services', async () => {
      await Config.createNewProjectEntry(today, headers, CONFIG_PATH, config);
    })
    .command('clock', 'Create a new entry', async ({ argv }) => {
      // user told us everything
      if (typeof argv.service !== 'undefined' && argv.time) {
        const { serviceId } = config.services[argv.service];
        await TimeEntry.createTimeEntry(
          argv.time,
          argv.note || '',
          today,
          config.userId,
          serviceId,
          headers
        );
        return;
      }

      // user told us only the service
      const { pick } = typeof argv.service !== 'undefined'
        ? { pick: argv.service === 'food' ? 'food' : config.services[argv.service].serviceId }
        : await inquirer.prompt([
          {
            type: 'list',
            message: 'Pick an option',
            name: 'pick',
            choices: [
              ...config.services.map((s) => ({
                value: s.serviceId,
                name: `Clock on: ${s.dealName} - ${s.serviceName}`,
              })),
              {
                value: 'food', name: 'Clock 30mins at food',
              },
            ],
          },
        ]);

      if (pick === 'food') {
        await TimeEntry.clockFood(headers, config, argv.date || today);
        return;
      }

      const { time = argv.time, note = argv.note } = await inquirer.prompt(
        [
          !argv.time && {
            type: 'input',
            message: 'Number of minutes to clock',
            name: 'time',
          },
          !argv.note && {
            type: 'input', message: 'Note', name: 'note',
          },
        ].filter(Boolean)
      );

      await TimeEntry.createTimeEntry(time, note, argv.date || today, config.userId, pick, headers);
    })
    .command('timer', 'Start a timer', async () => {
      const timer = await Timer.getRunningTimer(headers, config.userId, today);
      if (timer) {
        const { shouldStop } = await inquirer.prompt([
          {
            type: 'confirm',
            message: 'There is at timer alreay running. Would you like to stop it?',
            name: 'shouldStop',
          },
        ]);

        if (shouldStop) {
          await Timer.stopTimer(timer.id, headers);
        } else {
          return;
        }
      }

      const { pick, note } = await inquirer.prompt([
        {
          type: 'list',
          message: 'Start a timer for',
          name: 'pick',
          choices: [
            ...config.services.map((s) => ({
              value: s.serviceId,
              name: `${s.dealName} - ${s.serviceName}`,
            })),
          ],
        },
        {
          type: 'input', message: 'Note', name: 'note',
        },
      ]);

      const entry = await TimeEntry.createTimeEntry(0, note, today, config.userId, pick, headers);
      const entryId = entry.data.id;

      await Timer.startTimer(entryId, headers);
    })
    .command('stats', 'Show stats', async ({ argv }) => {
      await Reports.showStats(headers, config.userId, argv.date || today);
    })
    .command(
      'overtime',
      'Show overtime for this month (does not include today)',
      async ({ argv }) => {
        await Reports.showOvertime(headers, config.userId, argv.date || today);
      }
    )
    .demandCommand(1)
    .alias('s', 'service')
    .describe('s', 'Service')
    .alias('t', 'time')
    .describe('t', 'Time in minutes')
    .alias('n', 'note')
    .describe('n', 'Note')
    .alias('d', 'date')
    .describe('d', 'Date (yyyy-mm-dd)')
    .help('h')
    .alias('h', 'help').argv;
})();
