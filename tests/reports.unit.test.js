const Simple = require('simple-mock');
const Reports = require('../src/reports');
const Api = require('../src/api');
const Logger = require('../src/logger');

describe('Reports service: Stats', () => {
  afterEach(() => Simple.restore());

  it('should not show stats when there are no entires', async () => {
    Simple.mock(Api, 'get').resolveWith({
      data: [],
    });
    const log = Simple.mock(Logger, 'Log').returnWith();

    await Reports.showStats();
    expect(log.lastCall.arg).toBe('No worked hours');
  });

  it('should show stats when there are entires', async () => {
    Simple.mock(Api, 'get').resolveWith({
      data: [{ attributes: { time: 10 } }],
    });
    const log = Simple.mock(Logger, 'Log').returnWith();

    await Reports.showStats();
    expect(log.lastCall.args).toEqual(['Worked:', 0, 'h', 10, 'min']);
  });
});

describe('Reports service: Overtime', () => {
  afterEach(() => Simple.restore());

  it('should not show overtime when there is no overtime', async () => {
    Simple.mock(Api, 'get').resolveWith({
      data: [
        {
          attributes: {
            scheduled_time: 10,
            worked_time: 0,
          },
        },
      ],
    });
    const log = Simple.mock(Logger, 'Log').returnWith();

    await Reports.showOvertime({}, '123', '2020-01-01');
    expect(log.lastCall.args).toEqual(['No overtime. Missing:', 0, 'h', 10, 'min']);
  });

  it('should show overtime when there is overtime', async () => {
    Simple.mock(Api, 'get').resolveWith({
      data: [
        {
          attributes: {
            scheduled_time: 10,
            worked_time: 20,
          },
        },
      ],
    });
    const log = Simple.mock(Logger, 'Log').returnWith();

    await Reports.showOvertime({}, '123', '2020-01-01');
    expect(log.lastCall.args).toEqual(['Overtime logged:', 0, 'h', 10, 'min']);
  });
});
