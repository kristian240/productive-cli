const { get, patch } = require('./api');

async function startTimer(entryId, headers) {
  return patch(`time_entries/${entryId}/start`, {}, headers);
}

async function stopTimer(entryId, headers) {
  return patch(`time_entries/${entryId}/stop`, {}, headers);
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

module.exports = {
  startTimer,
  stopTimer,
  getRunningTimer,
};
