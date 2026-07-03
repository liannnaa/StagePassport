export type RootStackParamList = {
  MainTabs: undefined;
  PerformanceList: undefined;
  PerformanceDetail: { performanceId: string };
  PerformanceForm:
    | {
        mode: 'add'
      }
    | {
      mode: 'edit';
      performanceId: string
    };
  GroupedPerformances: 
    | {
        mode: 'concert';
        showId: string;
        title: string;
      }
    | {
        mode: 'artist';
        artistName: string;
        title: string;
      };
  ArtistForm:
    | { mode: 'add' }
    | { mode: 'edit'; artistName: string };
  ConcertForm:
    | { mode: 'add' }
    | { mode: 'edit'; showId: string };
  CatalogUsage:
    | {
        type: 'billing';
        id: string;
        label: string;
      }
    | {
        type: 'tag';
        id: string;
        label: string;
      }
    | {
        type: 'venue';
        id: string;
        label: string;
      }
    | {
        type: 'genre';
        id: string;
        label: string;
      }
    | {
        type: 'subGenre';
        id: string;
        label: string;
        genreId: string;
        genreName: string;
      };
  ManageCatalog: undefined;
  ManageVenues: undefined;
  ManageGenres: undefined;
  ManageSubGenres: {
    genreId: string;
    genreName: string;
  };
  ManageBillings: undefined;
  ManageTags: undefined;
  Settings: undefined;
  Credits: undefined;
};