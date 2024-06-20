import ical from 'node-ical';

const events = ical.sync.parseFile('Formula_1.ics');

let c = {};

console.log(c.events);

for (const event of Object.values(events)) {
    if(!(event.location in c))
        c[event.location] = [];

    c[event.location].push({
        summary: event.summary,
        start: event.start,
        end: event.end
    })
};

// console.log(c.Spain);

// LOCATION:Spain
// SUMMARY:🏎 FORMULA 1 ARAMCO GRAN PREMIO DE ESPAÑA 2024 - Practice 1
// DTSTAMP:20240620T131406Z
// DTSTART:20240621T113000Z
// DTEND:20240621T123000Z