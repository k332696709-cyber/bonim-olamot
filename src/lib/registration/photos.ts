/** All photo paths of a registration row: the main photo first, then the extra ones. */
export function allPhotoPaths(r: { photo_path?: string | null; extra_photo_paths?: string[] | null }): string[] {
  return [r.photo_path, ...(r.extra_photo_paths ?? [])].filter((p): p is string => !!p)
}
