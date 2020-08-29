class Utils {
  static parseTime(time) {
    // if time is number it is
    if (time?.match(/^\d+$/)) return +time;
    time = time.replace(/\s*/g, '').replace(/(\d*):(\d+)/g, (_, h, m) => `${h || '0'}h${m}m`);
    if (!time.match(/[\+-\*/]/g)) {
      return Utils.parseTimeSegment(time);
    }
    // TODO: calculations
  }

  static parseTimeSegment(timeSegment) {
    let {
      groups: { h, m },
    } = timeSegment.match(/((?<h>\d*)h(ours?)?)?((?<m>\d*)(m(ins?)?)?)?/i);

    h = h || 0;
    m = m || 0;

    return h * 60 + +m;
  }
}

module.exports = Utils;
