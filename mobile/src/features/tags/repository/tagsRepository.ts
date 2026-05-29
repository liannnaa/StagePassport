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
} from 'firebase/firestore';
import { db } from '../../auth/services/firebase';
import { TagOption } from '../types/tag';
import { buildTagKey } from '../utils/tagKeys';

const USERS_COLLECTION = 'users';
const TAGS_COLLECTION = 'tags';

type TagDoc = {
  name: string;
  normalizedName: string;
  createdAt: unknown;
  updatedAt: unknown;
};

function tagCollection(userId: string) {
  return collection(db, USERS_COLLECTION, userId, TAGS_COLLECTION);
}

function tagDoc(userId: string, normalizedName: string) {
  return doc(db, USERS_COLLECTION, userId, TAGS_COLLECTION, normalizedName);
}

function mapTag(id: string, data: Partial<TagDoc> | undefined): TagOption {
  return {
    id,
    name: data?.name ?? '',
    normalizedName: data?.normalizedName ?? '',
  };
}

export const tagsRepository = {
  async getAll(userId: string): Promise<TagOption[]> {
    const snapshot = await getDocs(
      query(tagCollection(userId), orderBy('name'))
    );

    return snapshot.docs.map((item) =>
      mapTag(item.id, item.data() as Partial<TagDoc>)
    );
  },

  async insert(userId: string, name: string): Promise<TagOption> {
    const trimmedName = name.trim();
    const normalizedName = buildTagKey(trimmedName);

    const ref = tagDoc(userId, normalizedName);

    await setDoc(
      ref,
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

  async delete(userId: string, id: string): Promise<void> {
    await deleteDoc(tagDoc(userId, id));
  },

  subscribe(
    userId: string,
    onData: (items: TagOption[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(tagCollection(userId), orderBy('name'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((item) =>
          mapTag(item.id, item.data() as Partial<TagDoc>)
        );
        onData(items);
      },
      (error) => onError?.(error)
    );
  },
};