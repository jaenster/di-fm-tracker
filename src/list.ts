import {Channel, StoredData} from "./types";
import * as fs from "fs";

Quit: {

    const [, , playlist] = process.argv;

    const storage: StoredData = JSON.parse(fs.readFileSync('./tracking-data.json').toString());

    const channelNames = Object.keys(storage.channels);
    if (!playlist) {
        console.log('list of channels');
        channelNames.forEach(el => console.log(el));
        break Quit;
    }


    if (!storage.channels[playlist]) {
        console.log('That channel does not exists');
        break Quit;
    }

    const channel = storage.channels[playlist];
    const tracks = Object.keys(channel.tracks).map(el => channel.tracks[el]);

    tracks.sort(({timesPlayed: a},{timesPlayed: b}) => b-a)

    tracks.forEach(track => {
        console.log(`${track.timesPlayed} - ${track.display_artist} ${track.display_title}`)
    })


}