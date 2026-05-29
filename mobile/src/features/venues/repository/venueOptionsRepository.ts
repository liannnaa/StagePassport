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
import { VenueOption } from '../types/venue';
import { buildVenueKey } from '../utils/venueMatching';

const USERS_COLLECTION = 'users';
const VENUES_COLLECTION = 'venues';

type VenueDoc = {
  venueName: string;
  city: string;
  normalizedKey: string;
  createdAt: unknown;
  updatedAt: unknown;
};

function venueCollection(userId: string) {
  return collection(db, USERS_COLLECTION, userId, VENUES_COLLECTION);
}

function venueDoc(userId: string, normalizedKey: string) {
  return doc(db, USERS_COLLECTION, userId, VENUES_COLLECTION, normalizedKey);
}

function mapVenue(id: string, data: Partial<VenueDoc> | undefined): VenueOption {
  return {
    id,
    venueName: data?.venueName ?? '',
    city: data?.city ?? '',
    normalizedKey: data?.normalizedKey ?? '',
  };
}

export const venueOptionsRepository = {
  async getAll(userId: string): Promise<VenueOption[]> {
    const snapshot = await getDocs(
      query(venueCollection(userId), orderBy('venueName'))
    );

    return snapshot.docs.map((item) =>
      mapVenue(item.id, item.data() as Partial<VenueDoc>)
    );
  },

  async insert(userId: string, venueName: string, city: string): Promise<VenueOption> {
    const trimmedVenueName = venueName.trim();
    const trimmedCity = city.trim();
    const normalizedKey = buildVenueKey(trimmedVenueName, trimmedCity);

    const ref = venueDoc(userId, normalizedKey);

    await setDoc(
      ref,
      {
        venueName: trimmedVenueName,
        city: trimmedCity,
        normalizedKey,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      id: normalizedKey,
      venueName: trimmedVenueName,
      city: trimmedCity,
      normalizedKey,
    };
  },

  async deleteVenueOption(userId: string, id: string): Promise<void> {
    await deleteDoc(venueDoc(userId, id));
  },

  subscribe(
    userId: string,
    onData: (items: VenueOption[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(venueCollection(userId), orderBy('venueName'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((item) =>
          mapVenue(item.id, item.data() as Partial<VenueDoc>)
        );
        onData(items);
      },
      (error) => onError?.(error)
    );
  },
};