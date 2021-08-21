import axios from "axios";
import {persist} from "./PersistentData";
import {DIFMNowPlaying, DIFMNowPlayingResponse, DIFMTrack} from "./di.fm";
import {Channel, StoredData, Track} from "./types";



const persistData = persist<StoredData>({channels: {},}, './tracking-data.json');

function getChannelObj(np: DIFMNowPlaying) {
    if (persistData.channels.hasOwnProperty(np.channel_key)) return persistData.channels[np.channel_key];
    return persistData.channels[np.channel_key] = {
        channel_id: np.channel_id,
        channel_key: np.channel_key,
        lastPlayed: 0,
        tracks: {}
    }
}

function getTrackObj(track: DIFMTrack, channel: Channel): Track {
    const {id} = track
    if (channel.tracks.hasOwnProperty(id)) return channel.tracks[id]
    const {display_artist, display_title, duration} = track;
    return channel.tracks[id] = {display_artist, display_title, duration, id, timesPlayed: 0}
}

async function getLatest() {
    const {data, status} = await axios.get<DIFMNowPlayingResponse>(`https://www.di.fm/_papi/v1/di/currently_playing`);
    console.log('status: '+status +' -- '+data.length)
    if (status !== 200) return;

    data.filter(el => el.track)
        .forEach(nowPlaying => {
            const channel = getChannelObj(nowPlaying);
            const {track} = nowPlaying;

            // if its still playing dont record it again
            if (channel.lastPlayed === track.id) return;

            channel.lastPlayed = track.id;
            console.log(`Now playing ${channel.channel_key} - ${track.display_artist} - ${track.display_title}`);
            getTrackObj(track, channel).timesPlayed++;
        })
}


(async function doIt() {
    await getLatest();
    setTimeout(doIt, 1000 * 30);
})();