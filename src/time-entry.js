const { get, post } = require('./api');

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

  await createTimeEntry(30, '', today, userId, serviceId, headers);
}

module.exports = {
  clockFood,
  createTimeEntry,
};
