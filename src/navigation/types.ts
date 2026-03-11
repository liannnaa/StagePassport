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
  ManageCatalog: undefined;
  ManageVenues: undefined;
  ManageGenres: undefined;
  ManageSubGenres: {
    genreId: string;
    genreName: string;
  };
  ManageTags: undefined;
  Settings: undefined;
  Credits: undefined;
};