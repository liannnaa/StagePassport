export type GenreOption = {
  id: string;
  name: string;
  normalizedName: string;
};

export type SubGenreOption = {
  id: string;
  genreId: string;
  name: string;
  normalizedKey: string;
};