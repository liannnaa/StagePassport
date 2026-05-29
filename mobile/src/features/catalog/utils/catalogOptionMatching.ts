import { PickerOption } from '../components/SearchablePickerField';

export function findExistingOption(options: PickerOption[], value: string) {
  const normalized = value.trim().toLowerCase();

  return options.find(
    (option) => option.title.trim().toLowerCase() === normalized
  );
}

export function findExistingVenueOption(
  options: PickerOption[],
  venueName: string,
  city?: string
) {
  const normalizedVenue = venueName.trim().toLowerCase();
  const normalizedCity = city?.trim().toLowerCase();

  return options.find((option) => {
    const sameVenue = option.title.trim().toLowerCase() === normalizedVenue;

    if (!normalizedCity) return sameVenue;

    return sameVenue && option.subtitle?.trim().toLowerCase() === normalizedCity;
  });
}