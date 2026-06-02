
export function findBySlug<T>(
  items: ReadonlyArray<T>,
  getSlug: (item: T) => string,
  slug: string,
): T | undefined {
  return items.find((item) => getSlug(item) === slug)
}
