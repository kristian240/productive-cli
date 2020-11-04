const Api = require('./api');

class Timer {
  static async startTimer(entryId, headers) {
    return Api.patch(`time_entries/${entryId}/start`, {}, headers);
  }

  static async stopTimer(entryId, headers) {
    return Api.patch(`time_entries/${entryId}/stop`, {}, headers);
  }

  static async getRunningTimer(headers, userId, today) {
    const entires = await Api.get(
      `time_entries?filter[person_id]=${userId}&filter[before]=${today}&filter[after]=${today}`,
      headers
    );

    if (!entires.data.length) {
      return;
    }

    return entires.data.find((entry) => Boolean(entry.attributes.timer_started_at));
  }
}

module.exports = Timer;
