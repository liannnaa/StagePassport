import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../auth/services/firebase';
import { Performance } from '../types/performance';
import { parseStoredDate } from '../utils/dates';

const USERS_COLLECTION = 'users';
const PERFORMANCES_COLLECTION = 'performances';

type PerformanceDoc = {
  artist: string;
  artistNormalized: string;
  venue: string;
  city: string;
  date: string;
  dateSortKey: string;
  tag: string;
  genre: string;
  subGenre: string;
  showId: string;
  showName: string;
  createdAt: unknown;
  updatedAt: unknown;
};

function normalizeArtist(value: string): string {
  return value.trim().toLowerCase();
}

function buildDateSortKey(date: string): string {
  const parsed = parseStoredDate(date);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function performanceCollection(userId: string) {
  return collection(db, USERS_COLLECTION, userId, PERFORMANCES_COLLECTION);
}

function performanceDoc(userId: string, performanceId: string) {
  return doc(db, USERS_COLLECTION, userId, PERFORMANCES_COLLECTION, performanceId);
}

function toPerformanceDoc(
  performance: Omit<Performance, 'id'>
): Omit<PerformanceDoc, 'createdAt' | 'updatedAt'> {
  return {
    artist: performance.artist,
    artistNormalized: normalizeArtist(performance.artist),
    venue: performance.venue,
    city: performance.city,
    date: performance.date,
    dateSortKey: buildDateSortKey(performance.date),
    tag: performance.tag,
    genre: performance.genre,
    subGenre: performance.subGenre,
    showId: performance.showId,
    showName: performance.showName,
  };
}

function mapPerformance(
  id: string,
  data: Partial<PerformanceDoc> | undefined
): Performance {
  return {
    id,
    artist: data?.artist ?? '',
    venue: data?.venue ?? '',
    city: data?.city ?? '',
    date: data?.date ?? '',
    tag: data?.tag ?? '',
    genre: data?.genre ?? '',
    subGenre: data?.subGenre ?? '',
    showId: data?.showId ?? '',
    showName: data?.showName ?? '',
  };
}

export const performancesRepository = {
  async getAll(userId: string): Promise<Performance[]> {
    const snapshot = await getDocs(
      query(performanceCollection(userId), orderBy('dateSortKey', 'desc'))
    );

    return snapshot.docs.map((item) =>
      mapPerformance(item.id, item.data() as Partial<PerformanceDoc>)
    );
  },

  async getById(
    userId: string,
    performanceId: string
  ): Promise<Performance | undefined> {
    const snapshot = await getDoc(performanceDoc(userId, performanceId));

    if (!snapshot.exists()) return undefined;

    return mapPerformance(
      snapshot.id,
      snapshot.data() as Partial<PerformanceDoc>
    );
  },

  async insert(
    userId: string,
    performance: Omit<Performance, 'id'>
  ): Promise<string> {
    const ref = doc(performanceCollection(userId));

    await setDoc(ref, {
      ...toPerformanceDoc(performance),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ref.id;
  },

  async update(
    userId: string,
    performanceId: string,
    performance: Omit<Performance, 'id'>
  ): Promise<void> {
    await setDoc(
      performanceDoc(userId, performanceId),
      {
        ...toPerformanceDoc(performance),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  async delete(userId: string, performanceId: string): Promise<void> {
    await deleteDoc(performanceDoc(userId, performanceId));
  },

  async updateGenresByArtist(
    userId: string,
    artistName: string,
    genre: string,
    subGenre: string
  ): Promise<void> {
    const normalizedArtist = normalizeArtist(artistName);

    const snapshot = await getDocs(
      query(
        performanceCollection(userId),
        where('artistNormalized', '==', normalizedArtist)
      )
    );

    if (snapshot.empty) return;

    const batch = writeBatch(db);

    snapshot.docs.forEach((item) => {
      batch.update(item.ref, {
        genre,
        subGenre,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  },

  subscribe(
    userId: string,
    onData: (items: Performance[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(performanceCollection(userId), orderBy('dateSortKey', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((item) =>
          mapPerformance(item.id, item.data() as Partial<PerformanceDoc>)
        );
        onData(items);
      },
      (error) => {
        onError?.(error);
      }
    );
  },
};