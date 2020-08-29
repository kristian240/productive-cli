const homedir = require('os').homedir();
const { format } = require('date-fns');
const inquirer = require('inquirer');

const Timer = require('./timer');
const TimeEntry = require('./time-entry');
const Config = require('./config');
const Reports = require('./reports');
const Logger = require('./logger');
const Api = require('./api');

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
          argv.task || undefined,
          today,
          config.userId,
          serviceId,
          headers
        );
        return;
      }

      // user told us only the service
      const { pick } =
        typeof argv.service !== 'undefined'
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
                    value: 'food',
                    name: 'Clock 30mins at food',
                  },
                ],
              },
            ]);

      if (pick === 'food') {
        await TimeEntry.clockFood(headers, config, argv.date || today);
        return;
      }

      let task = argv.task;

      if (!task) {
        const { withTask } = await inquirer.prompt([
          {
            type: 'list',
            message: 'Clock on task',
            name: 'withTask',
            choices: [
              {
                value: true,
                name: 'Yes',
              },
              {
                value: false,
                name: 'No',
              },
            ],
          },
        ]);

        if (withTask) {
          let projectId = (
            config.services[argv.service] ||
            config.services.find((service) => service.serviceId === pick)
          ).projectId;

          // if the service is added before task feature there is no projectId in services array
          if (!projectId) {
            const { included } = await Api.get('services/536162?include=deal.project', headers);

            const { id } = Api.findInInluded(included, 'projects');

            projectId = id;

            // TODO: write it to config file for nex time
          }

          const { taskName } = await inquirer.prompt([
            {
              type: 'input',
              message: 'Search for a task for by name',
              name: 'taskName',
            },
          ]);

          const tasks = await Api.get(
            `tasks?filter[project_id][eq]=${projectId}&filter[title][contains]=${taskName}&sort=title`,
            headers
          ).then(({ data: tasks }) =>
            tasks.map((task) => ({ value: task.id, name: task.attributes.title }))
          );

          const { taskId } = await inquirer.prompt([
            {
              type: 'list',
              message: 'Pick a task from the list',
              name: 'taskId',
              choices: tasks,
            },
          ]);

          task = taskId;
        }
      }

      const { time = argv.time, note = argv.note } = await inquirer.prompt(
        [
          !argv.time && {
            type: 'input',
            message: 'Number of minutes to clock',
            name: 'time',
          },
          !argv.note && {
            type: 'input',
            message: 'Note',
            name: 'note',
          },
        ].filter(Boolean)
      );

      await TimeEntry.createTimeEntry(
        time,
        note,
        task,
        argv.date || today,
        config.userId,
        pick,
        headers
      );
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
          type: 'input',
          message: 'Note',
          name: 'note',
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
