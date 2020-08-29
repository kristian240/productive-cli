const Simple = require('simple-mock');
const Utils = require('../src/utils');

describe('Time parsing', () => {
  afterEach(() => Simple.restore());

  it("shouldn't parse number", async () => {
    const parsedTime = Utils.parseTime('10');

    expect(parsedTime).toEqual(10);
  });

  it('should parse HH:MM format', async () => {
    const parsedTimes = ['1:00', '01:30', '1:3', '0:50', ':30'].map(Utils.parseTime);
    const expetedTimes = [60, 90, 63, 50, 30];

    expect(parsedTimes[0]).toEqual(expetedTimes[0]);
    expect(parsedTimes[1]).toEqual(expetedTimes[1]);
    expect(parsedTimes[2]).toEqual(expetedTimes[2]);
    expect(parsedTimes[3]).toEqual(expetedTimes[3]);
    expect(parsedTimes[4]).toEqual(expetedTimes[4]);
  });

  it('should parse HHh(ours)MMm(ins) format', async () => {
    const parsedTimes = ['1h', '1h30', '1h3m', '30m', '50min', '1hour30min', '2hours45mins'].map(
      Utils.parseTime
    );
    const expetedTimes = [60, 90, 63, 30, 50, 90, 165];

    expect(parsedTimes[0]).toEqual(expetedTimes[0]);
    expect(parsedTimes[1]).toEqual(expetedTimes[1]);
    expect(parsedTimes[2]).toEqual(expetedTimes[2]);
    expect(parsedTimes[3]).toEqual(expetedTimes[3]);
    expect(parsedTimes[4]).toEqual(expetedTimes[4]);
    expect(parsedTimes[5]).toEqual(expetedTimes[5]);
    expect(parsedTimes[6]).toEqual(expetedTimes[6]);
  });
});
