export type Performance = {
    id: string;
    artist: string;
    venue: string;
    city: string;
    date: string; // MM-DD-YY
    billing: string;
    tags: string[];
    genre: string;
    subGenre: string;
    showId: string;
    showName: string;
};

export type ConcertGroup = {
    showId: string;
    showName: string;
    date: string;
    venue: string;
    city: string;
    performances: Performance[];
    artistCount: number;
};

export type ArtistGroup = {
    artistName: string;
    performances: Performance[];
    performanceCount: number;
    latestDate: string;
    genre?: String;
    subGenre?: String;
};