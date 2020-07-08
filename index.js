#!/usr/bin/env node

const fs = require('fs');
const homedir = require('os').homedir();
const format = require('date-fns/format');
const fetch = require('node-fetch');
const { promisify } = require('util');
const inquirer = require('inquirer');
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('init', 'Init the cli')
  .command('config', 'Add new services')
  .command('clock', 'Create a new entry')
  .command('timer', 'Start a timer')
  .command('stats', 'Show stats')
  .alias('s', 'service')
  .nargs('s', 1)
  .describe('s', 'Service')
  .alias('t', 'time')
  .nargs('t', 1)
  .describe('t', 'Time in minutes')
  .alias('n', 'note')
  .nargs('n', 1)
  .describe('n', 'Note')
  .help('h')
  .alias('h', 'help').argv;

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONFIG_PATH = `${homedir}/.productivecli`;

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

async function clockFood(headers, config, today) {
  const matchingDeal = await get(
    `deals?filter[query]=operations%20general&filter[date][lt_eq]=${today}&filter[end_date][gt_eq]=${today}`,
    headers
  );

  const matchingService = await get(
    `services?filter[name]=food&filter[deal_id]=${matchingDeal.data[0].id}`,
    headers
  );

  const userId = config.userId;
  const serviceId = matchingService.data[0].id;

  await post(
    'time_entries',
    {
      data: {
        attributes: {
          date: today,
          time: 30,
          billable_time: 30,
          note: '',
        },
        relationships: {
          person: { data: { type: 'people', id: userId } },
          service: { data: { type: 'services', id: serviceId } },
        },
        type: 'time-entries',
      },
    },
    headers
  );
}

async function findDeal(search, headers, today) {
  const matchingDeal = await get(
    `deals?filter[query]=${search}&filter[date][lt_eq]=${today}&filter[end_date][gt_eq]=${today}`,
    headers
  );
  return matchingDeal.data.map((d) => ({
    value: d.id,
    name: `${d.attributes.name} ${d.attributes.date}`,
  }));
}

async function findService(dealId, headers) {
  const matchingService = await get(`services?filter[deal_id]=${dealId}`, headers);
  return matchingService.data.map((d) => ({ value: d.id, name: d.attributes.name }));
}

async function createTimeEntry(time, note, today, userId, serviceId, headers) {
  return post(
    'time_entries',
    {
      data: {
        attributes: {
          date: today,
          time: time,
          billable_time: time,
          note: note,
        },
        relationships: {
          person: { data: { type: 'people', id: userId } },
          service: { data: { type: 'services', id: serviceId } },
        },
        type: 'time-entries',
      },
    },
    headers
  );
}

async function startTimer(entryId, headers) {
  return patch(`time_entries/${entryId}/start`, {}, headers);
}

async function stopTimer(entryId, headers) {
  return patch(`time_entries/${entryId}/stop`, {}, headers);
}

async function createNewProjectEntry(today, headers) {
  const { query } = await inquirer.prompt([
    { type: 'input', message: 'Project name', name: 'query' },
  ]);
  const deals = await findDeal(query, headers, today);

  const { dealId } = await inquirer.prompt([
    { type: 'list', message: 'Select a project', name: 'dealId', choices: deals },
  ]);

  const services = await findService(dealId, headers);
  const { serviceId } = await inquirer.prompt([
    { type: 'list', message: 'Select a service', name: 'serviceId', choices: services },
  ]);

  return {
    serviceId: serviceId,
    serviceName: services.find((s) => s.value === serviceId).name,
    dealName: deals.find((d) => d.value === dealId).name,
  };
}

async function createConfig() {
  const { token } = await inquirer.prompt([
    { type: 'input', message: 'Productive.io token', name: 'token' },
  ]);

  const org = await get('organization_memberships', {
    'Content-Type': 'application/vnd.api+json',
    'X-Auth-Token': token,
  });

  return {
    token,
    orgId: org.data[0].relationships.organization.data.id,
    userId: org.data[0].relationships.person.data.id,
    services: [],
  };
}

async function getConfig() {
  try {
    const file = await readFile(CONFIG_PATH, { encoding: 'utf-8' });
    const config = JSON.parse(file);

    return config;
  } catch (e) {
    return null;
  }
}

async function getRunningTimer(headers, userId, today) {
  const entires = await get(
    `time_entries?filter[person_id]=${userId}&filter[before]=${today}&filter[after]=${today}`,
    headers
  );

  if (!entires.data.length) {
    return;
  }

  return entires.data.find((entry) => Boolean(entry.attributes.timer_started_at));
}

async function showStats(headers, userId, today) {
  const entires = await get(
    `time_entries?filter[person_id]=${userId}&filter[before]=${today}&filter[after]=${today}`,
    headers
  );

  if (!entires.data.length) {
    return;
  }

  const totalMinutes = entires.data.map((e) => e.attributes.time).reduce((prev, acc) => prev + acc);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  console.log('Worked today:', hours || 0, 'h', minutes || 0, 'min');
}

async function app() {
  const today = format(new Date(), 'yyyy-MM-dd');

  if (argv['_'][0] === 'init') {
    const initConfig = await createConfig();
    await writeFile(CONFIG_PATH, JSON.stringify(initConfig));
  }

  const config = await getConfig();

  if (!config) {
    console.log('Run productive-cli init first!');
    return;
  }

  const headers = {
    'Content-Type': 'application/vnd.api+json',
    'X-Auth-Token': config.token,
    'X-Organization-Id': config.orgId,
  };

  if (argv['_'][0] === 'stats') {
    await showStats(headers, config.userId, today);
    return;
  }

  if (argv['_'][0] === 'config') {
    const service = await createNewProjectEntry(today, headers);

    const newConfig = {
      ...config,
      services: [...(config.services || []), service],
    };

    await writeFile(CONFIG_PATH, JSON.stringify(newConfig));
  }

  if (argv['_'][0] === 'timer') {
    const timer = await getRunningTimer(headers, config.userId, today);
    if (timer) {
      const { shouldStop } = await inquirer.prompt([
        {
          type: 'confirm',
          message: 'There is at timer alreay running. Would you like to stop it?',
          name: 'shouldStop',
        },
      ]);

      if (shouldStop) {
        await stopTimer(timer.id, headers);
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
      { type: 'input', message: 'Note', name: 'note' },
    ]);

    const entry = await createTimeEntry(0, note, today, config.userId, pick, headers);
    const entryId = entry.data.id;

    await startTimer(entryId, headers);
    return;
  }

  if (argv['_'][0] === 'clock') {
    // user told us everything
    if (typeof argv.service !== 'undefined' && argv.time) {
      const serviceId = config.services[argv.service].serviceId;
      await createTimeEntry(argv.time, argv.note || '', today, config.userId, serviceId, headers);
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
                { value: 'food', name: 'Clock 30mins at food' },
              ],
            },
          ]);

    if (pick === 'food') {
      await clockFood(headers, config, today);
      return;
    }

    const { time = argv.time, note = argv.note } = await inquirer.prompt(
      [
        !Boolean(argv.time) && {
          type: 'input',
          message: 'Number of minutes to clock',
          name: 'time',
        },
        !Boolean(argv.note) && { type: 'input', message: 'Note', name: 'note' },
      ].filter(Boolean)
    );

    await createTimeEntry(time, note, today, config.userId, pick, headers);

    return;
  }
}

app();
