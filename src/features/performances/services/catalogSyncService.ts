import { CatalogSyncRow } from '../types/performanceContextTypes';

import { venueOptionsRepository } from '../../venues/repository/venueOptionsRepository';
import { buildVenueKey } from '../../venues/utils/venueMatching';

import { genresRepository } from '../../genres/repository/genresRepository';

import { billingsRepository } from '../../billings/repository/billingsRepository';
import { tagsRepository } from '../../tags/repository/tagsRepository';

export async function syncCatalogOptions(
  userId: string,
  rows: CatalogSyncRow[]
): Promise<void> {
  const uniqueVenues = rows.filter(
    (row, index, allRows) =>
      row.venue.trim() &&
      row.city.trim() &&
      index ===
        allRows.findIndex(
          (candidate) =>
            buildVenueKey(candidate.venue, candidate.city) ===
            buildVenueKey(row.venue, row.city)
        )
  );

  for (const row of uniqueVenues) {
    await venueOptionsRepository.insert(userId, row.venue, row.city);
  }

  const uniqueGenres = rows.filter(
    (row, index, allRows) =>
      row.genre.trim() &&
      index ===
        allRows.findIndex(
          (candidate) =>
            candidate.genre.trim().toLowerCase() ===
            row.genre.trim().toLowerCase()
        )
  );

  for (const row of uniqueGenres) {
    const insertedGenre = await genresRepository.insertGenre(
      userId,
      row.genre
    );

    const subGenresForGenre = rows.filter(
      (candidate) =>
        candidate.genre.trim().toLowerCase() ===
          row.genre.trim().toLowerCase() && candidate.subGenre.trim()
    );

    const uniqueSubGenres = subGenresForGenre.filter(
      (candidate, index, allRows) =>
        index ===
        allRows.findIndex(
          (item) =>
            item.subGenre.trim().toLowerCase() ===
            candidate.subGenre.trim().toLowerCase()
        )
    );

    for (const subGenreRow of uniqueSubGenres) {
      await genresRepository.insertSubGenre(
        userId,
        insertedGenre.id,
        insertedGenre.name,
        subGenreRow.subGenre
      );
    }
  }

  const uniqueBillings = rows
    .map((row) => row.billing)
    .filter((billing) => billing.trim())
    .filter(
      (billing, index, allBillings) =>
        index ===
        allBillings.findIndex(
          (candidate) =>
            candidate.trim().toLowerCase() === billing.trim().toLowerCase()
        )
    );

  for (const billing of uniqueBillings) {
    await billingsRepository.insert(userId, billing);
  }

  const uniqueTags = rows
    .flatMap((row) => row.tags ?? [])
    .filter((tag) => tag.trim())
    .filter(
      (tag, index, allTags) =>
        index ===
        allTags.findIndex(
          (candidate) =>
            candidate.trim().toLowerCase() === tag.trim().toLowerCase()
        )
    );

  for (const tag of uniqueTags) {
    await tagsRepository.insert(userId, tag);
  }
}