import fs from 'fs';
import ical from 'node-ical';

const calendar_events = ical.parseFile('./Formula_1.ics');

let unsorted_events = {};

for (const event of Object.values(calendar_events)) {
    if(event.location === undefined || event.location === '' || event.summary === undefined || event.summary === '')
        continue;

    let grand_prix_info = event.summary.split(' - ');

    let grand_prix = grand_prix_info[0];
    let session_type = grand_prix_info[1];


    let index = grand_prix.search("FORMULA 1 ");

    grand_prix = grand_prix.substring(index);

    if(!(grand_prix in unsorted_events)) {
        unsorted_events[grand_prix] = {
            race: grand_prix,
            country: event.location,
            location: {
                latitude: 0,
                longitude: 0
            },
            start: event.start,
            end: '',
            sessions: []
        };
    }
    
    unsorted_events[grand_prix].sessions.push({
        session_type: session_type,
        start: event.start,
        end: event.end
    });

    //Removes old grand prix weekends
    //Races are assumed to be 2 hours long, so if this script is ran 2 hours after
    //A race start, the race wont be included
    if(session_type.search("Race") != -1 && session_type.search("Sprint") == -1) {
        unsorted_events[grand_prix].end = event.end;

        if(Date.now() > event.end)
            delete unsorted_events[grand_prix];
    }
}

let sorted_events = Object.values(unsorted_events);

//Sort grand prix weekends by date
sorted_events.sort((a, b) => a.start - b.start);

//Sort each session of a grand prix weekend by date
for(let i = 0; i < sorted_events.length; i++) {
    sorted_events[i].sessions.sort((a, b) => a.start - b.start);
}

fs.writeFile('Formula_1.json', JSON.stringify(sorted_events, null, '\t'), 'utf8', (err) => {
    if(err)
        return console.error(err);

    console.log("Successfully wrote to Formula_1.json");
});