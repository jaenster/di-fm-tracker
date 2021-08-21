export interface DIFMTrack {
    display_artist: string
    display_title: string
    duration: number,
    id: number,
    start_time: string
}

export interface DIFMNowPlaying {
    channel_id: number,
    channel_key: string,
    track: DIFMTrack
}

export type DIFMNowPlayingResponse = DIFMNowPlaying[];
