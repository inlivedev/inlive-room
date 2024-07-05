export function generateDateTime(
  time: {
    start: Date;
    end: Date;
  },
  timezone: string
) {
  const eventDate = Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: timezone,
  }).format(time.start);

  const eventStartTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: timezone,
  }).format(time.start);

  const eventEndTime = Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: timezone,
  }).format(time.end);

  const icalStartDate = Intl.DateTimeFormat('fr-CA', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
    .format(time.start)
    .replaceAll('-', '');

  const icalStartTime = Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
  })
    .format(time.start)
    .replaceAll(':', '');

  const icalEndDate = Intl.DateTimeFormat('fr-CA', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
    .format(time.end)
    .replaceAll('-', '');

  const icalEndTime = Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
  })
    .format(time.end)
    .replaceAll(':', '');

  const DTSTAMP = `${icalStartDate}T${icalStartTime}`;
  const DTSTART = `${icalStartDate}T${icalStartTime}`;
  const DTEND = `${icalEndDate}T${icalEndTime}`;
  return { eventDate, eventStartTime, eventEndTime, DTSTAMP, DTSTART, DTEND };
}
