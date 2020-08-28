const boxen = require('boxen');

class Logger {
  static Log(...args) {
    console.log(...args);
  }

  static BoxPrint(...args) {
    console.log(boxen(...args, { padding: 1 }));
  }
}

module.exports = Logger;
