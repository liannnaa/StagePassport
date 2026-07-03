export function hasTag(tags: string[], tagName: string) {
  return tags.some(
    (tag) => tag.trim().toLowerCase() === tagName.trim().toLowerCase()
  );
}

export function addUniqueTag(tags: string[], tagName: string) {
  return hasTag(tags, tagName) ? tags : [...tags, tagName];
}

export function removeTag(tags: string[], tagName: string) {
  return tags.filter(
    (tag) => tag.trim().toLowerCase() !== tagName.trim().toLowerCase()
  );
}