const Api = require('./api');
const Utils = require('./utils');

class TimeEntry {
  static async createTimeEntry(time, note, task, today, userId, serviceId, headers) {
    return Api.post(
      'time_entries',
      {
        data: {
          attributes: {
            date: today,
            time: Utils.parseTime(time),
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
            ...(task
              ? {
                task: {
                  data: {
                    type: 'tasks',
                    id: task,
                  },
                },
              }
              : {}),
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
