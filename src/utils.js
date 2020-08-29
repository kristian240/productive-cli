class Utils {
  static parseTime(time) {
    // if time is number it is
    if (!isNaN(+time)) return time;
    time = time.replace(/\s*/g, '').replace(/(\d*):(\d+)/g, `${$1 || '0'}h$2`);
    if (!time.match(/[+-]/g)) {
      return this.parseTimeSegment(time);
    }
    // do calculations
  }

  static parseTimeSegment(timeSegment) {
    const h = timeSegment.match(/(\d+)h(ours)?/i);
    const m = timeSegment.match(/(\d+)(m(ins?)?)?/i);

    return h * 60 + m;
  }
}

module.exports = Utils;
