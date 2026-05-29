export type ConcertSharedFields = {
  showName: string;
  venue: string;
  city: string;
  date: string;
};

export type ConcertArtistDraft = {
  artist: string;
  billing: string;
  tags: string[];
  genre: string;
  subGenre: string;
};

export type ConcertSavePayload = {
  shared: ConcertSharedFields;
  artists: ConcertArtistDraft[];
};