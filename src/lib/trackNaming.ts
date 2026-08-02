/**
 * Shared track-naming helpers.
 *
 * These functions are the single source of truth for how a storage object
 * (bucket folder + file name) maps to a display artist/title and to the
 * stable `track_id` slug used across analytics. Both `useSupabaseData`
 * (player data) and `useTrackDirectory` (analytics name resolution) import
 * from here so the slugs they generate are guaranteed to match — that match
 * is what lets the analytics dashboard resolve clean names for each track.
 */

export type MediaType = 'audio' | 'video';

export interface DerivedTrackName {
  artist: string;
  title: string;
}

/**
 * Derive a human-readable artist + title from a bucket folder name and file
 * name. Folder name is the default artist (e.g. "ed-sheeran" -> "Ed Sheeran");
 * a "Artist - Title" file name overrides both.
 */
export const deriveArtistAndTitle = (
  folderName: string,
  fileName: string
): DerivedTrackName => {
  let artist =
    folderName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
    'Unknown Artist';
  let title = fileName.replace(/\.[^/.]+$/, '');

  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts[1].trim();
    }
  }

  return { artist, title };
};

/**
 * Build the stable `track_id` slug for a track, e.g.
 * ("audio", "ed-sheeran", "Perfect") -> "audio-ed-sheeran-perfect".
 * `title` is the derived (post "Artist - Title" split) title.
 */
export const buildTrackId = (
  type: MediaType,
  folderName: string,
  title: string
): string => {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  return `${type}-${folderName}-${cleanTitle}`;
};

/**
 * Best-effort, last-resort prettifier for a `track_id` when no storage object
 * matches it (e.g. orphaned analytics rows). We can't recover the exact
 * folder/title boundary from the slug alone, so we just title-case the slug
 * remainder and leave the artist unknown.
 */
export const prettifyTrackId = (trackId: string): DerivedTrackName => {
  const stripped = trackId.replace(/^(audio|video)-/, '');
  const words = stripped.split('-').filter(Boolean).join(' ').trim();
  const title = words
    ? words.replace(/\b\w/g, (l) => l.toUpperCase())
    : trackId;
  return { artist: 'Unknown Artist', title };
};
