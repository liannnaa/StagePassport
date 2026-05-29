import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../auth/services/firebase';
import { GenreOption, SubGenreOption } from '../types/genre';
import { buildGenreKey, buildSubGenreKey } from '../utils/genreKeys';

const USERS_COLLECTION = 'users';
const GENRES_COLLECTION = 'genres';
const SUB_GENRES_COLLECTION = 'subGenres';

type GenreDoc = {
  name: string;
  normalizedName: string;
  createdAt: unknown;
  updatedAt: unknown;
};

type SubGenreDoc = {
  genreId: string;
  name: string;
  normalizedKey: string;
  createdAt: unknown;
  updatedAt: unknown;
};

function genresCollection(userId: string) {
  return collection(db, USERS_COLLECTION, userId, GENRES_COLLECTION);
}

function genreDoc(userId: string, normalizedName: string) {
  return doc(db, USERS_COLLECTION, userId, GENRES_COLLECTION, normalizedName);
}

function subGenresCollection(userId: string) {
  return collection(db, USERS_COLLECTION, userId, SUB_GENRES_COLLECTION);
}

function subGenreDoc(userId: string, normalizedKey: string) {
  return doc(db, USERS_COLLECTION, userId, SUB_GENRES_COLLECTION, normalizedKey);
}

function mapGenre(id: string, data: Partial<GenreDoc> | undefined): GenreOption {
  return {
    id,
    name: data?.name ?? '',
    normalizedName: data?.normalizedName ?? '',
  };
}

function mapSubGenre(
  id: string,
  data: Partial<SubGenreDoc> | undefined
): SubGenreOption {
  return {
    id,
    genreId: data?.genreId ?? '',
    name: data?.name ?? '',
    normalizedKey: data?.normalizedKey ?? '',
  };
}

export const genresRepository = {
  async getAllGenres(userId: string): Promise<GenreOption[]> {
    const snapshot = await getDocs(
      query(genresCollection(userId), orderBy('name'))
    );

    return snapshot.docs.map((item) =>
      mapGenre(item.id, item.data() as Partial<GenreDoc>)
    );
  },

  async getAllSubGenres(userId: string): Promise<SubGenreOption[]> {
    const snapshot = await getDocs(
      query(subGenresCollection(userId), orderBy('name'))
    );

    return snapshot.docs.map((item) =>
      mapSubGenre(item.id, item.data() as Partial<SubGenreDoc>)
    );
  },

  async getSubGenresByGenreId(
    userId: string,
    genreId: string
  ): Promise<SubGenreOption[]> {
    const all = await this.getAllSubGenres(userId);
    return all.filter((item) => item.genreId === genreId);
  },

  async deleteGenre(userId: string, normalizedGenreId: string): Promise<void> {
    const subGenres = await this.getAllSubGenres(userId);
    const matching = subGenres.filter((item) => item.genreId === normalizedGenreId);
    const batch = writeBatch(db);

    matching.forEach((item) => {
      batch.delete(subGenreDoc(userId, item.id));
    });

    batch.delete(genreDoc(userId, normalizedGenreId));
    await batch.commit();
  },

  async deleteSubGenre(userId: string, normalizedSubGenreId: string): Promise<void> {
    await deleteDoc(subGenreDoc(userId, normalizedSubGenreId));
  },

  async insertGenre(userId: string, name: string): Promise<GenreOption> {
    const trimmedName = name.trim();
    const normalizedName = buildGenreKey(trimmedName);

    await setDoc(
      genreDoc(userId, normalizedName),
      {
        name: trimmedName,
        normalizedName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      id: normalizedName,
      name: trimmedName,
      normalizedName,
    };
  },

  async insertSubGenre(
    userId: string,
    genreId: string,
    genreName: string,
    subGenreName: string
  ): Promise<SubGenreOption> {
    const trimmedName = subGenreName.trim();
    const normalizedKey = buildSubGenreKey(genreName, trimmedName);

    await setDoc(
      subGenreDoc(userId, normalizedKey),
      {
        genreId,
        name: trimmedName,
        normalizedKey,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      id: normalizedKey,
      genreId,
      name: trimmedName,
      normalizedKey,
    };
  },

  subscribeGenres(
    userId: string,
    onData: (items: GenreOption[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(genresCollection(userId), orderBy('name'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((item) =>
          mapGenre(item.id, item.data() as Partial<GenreDoc>)
        );
        onData(items);
      },
      (error) => onError?.(error)
    );
  },

  subscribeSubGenres(
    userId: string,
    onData: (items: SubGenreOption[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(subGenresCollection(userId), orderBy('name'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((item) =>
          mapSubGenre(item.id, item.data() as Partial<SubGenreDoc>)
        );
        onData(items);
      },
      (error) => onError?.(error)
    );
  },
};