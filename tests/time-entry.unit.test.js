const Simple = require('simple-mock');
const TimeEntry = require('../src/time-entry');
const Api = require('../src/Api');

describe('Time entry service: create time entry', () => {
  afterEach(() => Simple.restore());

  it('should correctly create a time entry', async () => {
    const post = Simple.mock(Api, 'post').resolveWith({});

    const time = 10;
    const note = 'note';
    const date = '2020-01-01';
    const personId = '1234';
    const serviceId = '5678';
    const headers = {};

    await TimeEntry.createTimeEntry(time, note, date, personId, serviceId, headers);
    expect(post.lastCall.args).toEqual([
      'time_entries',
      {
        data: {
          attributes: {
            billable_time: time,
            date,
            note,
            time,
          },
          relationships: {
            person: {
              data: {
                id: personId,
                type: 'people',
              },
            },
            service: {
              data: {
                id: serviceId,
                type: 'services',
              },
            },
          },
          type: 'time-entries',
        },
      },
      headers,
    ]);
  });
});
