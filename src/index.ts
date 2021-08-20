import axios from "axios";
import {persist} from "./PersistentData";
import NowPlaying = DIFM.NowPlaying;

namespace DIFM {
    export interface Track {
        display_artist: string
        display_title: string
        duration: number,
        id: number,
        start_time: string
    }

    export interface NowPlaying {
        channel_id: number,
        channel_key: string,
        track: Track
    }

    export type NowPlayingResponse = NowPlaying[];
}

type Track = Omit<DIFM.Track, 'start_time'> & { timesPlayed: number };

interface Channel {
    channel_id: number,
    channel_key: string,
    lastPlayed: number
    tracks: { [data: string]: Track },
}

interface StoredData {
    channels: { [data: string]: Channel },
}

const persistData = persist<StoredData>({channels: {},}, './tracking-data.json');

function getChannelObj(np: NowPlaying) {
    if (persistData.channels.hasOwnProperty(np.channel_key)) return persistData.channels[np.channel_key];
    return persistData.channels[np.channel_key] = {
        channel_id: np.channel_id,
        channel_key: np.channel_key,
        lastPlayed: 0,
        tracks: {}
    }
}

function getTrackObj(track: DIFM.Track, channel: Channel): Track {
    const {id} = track
    if (channel.tracks.hasOwnProperty(id)) return channel.tracks[id]
    const {display_artist, display_title, duration} = track;
    return channel.tracks[id] = {display_artist, display_title, duration, id, timesPlayed: 0}
}

async function getLatest() {
    const {data, status} = await axios.get<DIFM.NowPlayingResponse>(`https://www.di.fm/_papi/v1/di/currently_playing`);
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