const Api = require('./api');

class TimeEntry {
  static async createTimeEntry(time, note, today, userId, serviceId, headers) {
    return Api.post(
      'time_entries',
      {
        data: {
          attributes: {
            date: today,
            time,
            billable_time: time,
            note,
          },
          relationships: {
            person: {
              data: {
                type: 'people',
                id: userId,
              },
            },
            service: {
              data: {
                type: 'services',
                id: serviceId,
              },
            },
          },
          type: 'time-entries',
        },
      },
      headers
    );
  }

  static async clockFood(headers, config, today) {
    const matchingDeal = await Api.get(
      `deals?filter[query]=operations%20general&filter[date][lt_eq]=${today}&filter[end_date][gt_eq]=${today}`,
      headers
    );

    const matchingService = await Api.get(
      `services?filter[name]=food&filter[deal_id]=${matchingDeal.data[0].id}`,
      headers
    );

    const { userId } = config;
    const serviceId = matchingService.data[0].id;

    await TimeEntry.createTimeEntry(30, '', today, userId, serviceId, headers);
  }
}

module.exports = TimeEntry;
