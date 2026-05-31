import { auth } from '../features/auth/services/firebase';
import { Performance } from '../features/performances/types/performance';
import { PerformancePayload } from '../features/performances/types/performanceContextTypes';
import { buildShowId } from '../features/performances/utils/showId';

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

export async function createPerformanceFromApi(payload: PerformancePayload): Promise<Performance> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const performance = {
    ...payload,
    showId: buildShowId(payload.showName, payload.date),
  };

  const res = await fetch(`${API_URL}/api/performances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(performance),
  });

  if (!res.ok) {
    throw new Error(`Failed to create performance: ${res.status}`);
  }

  return res.json();
}

export async function createPerformancesBatchFromApi(payloads: Array<Omit<Performance, 'id'>>): Promise<Performance[]> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const res = await fetch(`${API_URL}/api/performances/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payloads),
  });

  if (!res.ok) {
    throw new Error(`Failed to create performances batch: ${res.status}`);
  }

  return res.json();
}