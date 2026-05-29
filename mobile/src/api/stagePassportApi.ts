import { auth } from '../features/auth/services/firebase';
import { Performance } from '../features/performances/types/performance';

const API_URL = 'http://192.168.1.94:8080';

export async function getPerformancesFromApi(): Promise<Performance[]> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch performances: ${res.status}`);
  }

  return res.json();
}