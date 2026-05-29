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
import { BillingOption } from '../types/billing';
import { buildBillingKey } from '../utils/billingKeys';

const USERS_COLLECTION = 'users';
const BILLINGS_COLLECTION = 'billings';

type BillingDoc = {
  name: string;
  normalizedName: string;
  createdAt: unknown;
  updatedAt: unknown;
};

function billingCollection(userId: string) {
  return collection(db, USERS_COLLECTION, userId, BILLINGS_COLLECTION);
}

function billingDoc(userId: string, normalizedName: string) {
  return doc(db, USERS_COLLECTION, userId, BILLINGS_COLLECTION, normalizedName);
}

function mapBilling(id: string, data: Partial<BillingDoc> | undefined): BillingOption {
  return {
    id,
    name: data?.name ?? '',
    normalizedName: data?.normalizedName ?? '',
  };
}

export const billingsRepository = {
  async getAll(userId: string): Promise<BillingOption[]> {
    const snapshot = await getDocs(
      query(billingCollection(userId), orderBy('name'))
    );

    return snapshot.docs.map((item) =>
      mapBilling(item.id, item.data() as Partial<BillingDoc>)
    );
  },

  async insert(userId: string, name: string): Promise<BillingOption> {
    const trimmedName = name.trim();
    const normalizedName = buildBillingKey(trimmedName);

    const ref = billingDoc(userId, normalizedName);

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
    await deleteDoc(billingDoc(userId, id));
  },

  subscribe(
    userId: string,
    onData: (items: BillingOption[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(billingCollection(userId), orderBy('name'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((item) =>
          mapBilling(item.id, item.data() as Partial<BillingDoc>)
        );
        onData(items);
      },
      (error) => onError?.(error)
    );
  },
};