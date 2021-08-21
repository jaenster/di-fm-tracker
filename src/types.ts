import {DIFMTrack} from "./di.fm";

export type Track = Omit<DIFMTrack, 'start_time'> & { timesPlayed: number };

export interface Channel {
    channel_id: number,
    channel_key: string,
    lastPlayed: number
    tracks: { [data: string]: Track },
}

export interface StoredData {
    channels: { [data: string]: Channel },
}