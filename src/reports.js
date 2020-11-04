const Api = require('./api');
const Logger = require('./logger');

class Reports {
  static async showStats(headers, userId, today) {
    const entires = await Api.get(
      `time_entries?filter[person_id]=${userId}&filter[before]=${today}&filter[after]=${today}`,
      headers
    );

    if (!entires.data.length) {
      Logger.Log('No worked hours');
      return;
    }

    const totalMinutes = entires.data
      .map((e) => e.attributes.time)
      .reduce((prev, acc) => prev + acc);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    Logger.Log('Worked:', hours || 0, 'h', minutes || 0, 'min');
  }

  static async showOvertime(headers, userId, today) {
    const [year, month, day] = today.split('-');
    const startDate = `${year}-${month}-01`;
    const yesterday = day - 1 <= 0 ? 1 : day - 1;
    const endDate = `${year}-${month}-${yesterday}`;

    const { data: [report] = [] } = await Api.get(
      `time_reports?filter[person_id]=${userId}&filter[before]=${endDate}&filter[after]=${startDate}`,
      headers
    );

    if (!report) {
      return;
    }

    const { scheduled_time: scheduledTime, worked_time: workedTime } = report.attributes;

    const totalMinutes = workedTime - scheduledTime;
    const hours = totalMinutes >= 60 ? Math.floor(totalMinutes / 60) : 0;
    const minutes = totalMinutes % 60;

    if (hours < 0 || minutes < 0) {
      Logger.Log('No overtime. Missing:', Math.abs(hours) || 0, 'h', Math.abs(minutes) || 0, 'min');
      return;
    }

    Logger.Log('Overtime logged:', hours || 0, 'h', minutes || 0, 'min');
  }
}

module.exports = Reports;
