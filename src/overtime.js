const { get } = require('./api');

async function showStats(headers, userId, today) {
  const entires = await get(
    `time_entries?filter[person_id]=${userId}&filter[before]=${today}&filter[after]=${today}`,
    headers
  );

  if (!entires.data.length) {
    console.log('No worked hours.');
    return;
  }

  const totalMinutes = entires.data.map((e) => e.attributes.time).reduce((prev, acc) => prev + acc);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  console.log('Worked:', hours || 0, 'h', minutes || 0, 'min');
}

async function showOvertime(headers, userId, today) {
  const [year, month, day] = today.split('-');
  const startDate = `${year}-${month}-01`;
  const yesterday = day - 1 <= 0 ? 1 : day - 1;
  const endDate = `${year}-${month}-${yesterday}`;

  const { data: [report] = [] } = await get(
    `time_reports?filter[person_id]=${userId}&filter[before]=${endDate}&filter[after]=${startDate}`,
    headers,
  );

  if (!report) {
    return;
  }

  const { scheduled_time, worked_time } = report.attributes;

  const totalMinutes = worked_time - scheduled_time;
  const hours = totalMinutes >= 60 ? Math.floor(totalMinutes / 60) : 0;
  const minutes = totalMinutes % 60;

  if (hours < 0 || minutes < 0) {
    console.log('No overtime. Missing:', Math.abs(hours) || 0, 'h', Math.abs(minutes) || 0, 'min');
    return;
  }

  console.log('Overtime logged:', hours || 0, 'h', minutes || 0, 'min');
}

module.exports = {
  showStats,
  showOvertime,
};