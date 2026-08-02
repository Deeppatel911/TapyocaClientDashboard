import { useMemo } from 'react';
import { useAnalyticsData } from './useAnalyticsData';

/**
 * Behavioral, per-user track recommendations.
 *
 * Ranks a set of candidate tracks (the catalog the player already has) using
 * the listener's own engagement from the event stream (via useAnalyticsData):
 *   - artist affinity (plays + completion, minus skips)
 *   - discovery bonus for unplayed tracks (weighted toward liked artists)
 *   - skip penalty
 *   - mild replay value for tracks the listener tends to finish
 *
 * No content metadata or cross-user data is required, so it works today and is
 * fully testable. (True "similar-sounding" / "fans like you" discovery needs a
 * tag/embedding layer or a user base — intentionally out of scope for now.)
 */

export interface RecommendationCandidate {
  id: string;
  title: string;
  artist: string;
}

export interface Recommendation extends RecommendationCandidate {
  trackId: string;
  reason: string;
  score: number;
}

// Scoring weights (kept explicit/transparent so they're easy to tune).
const W_AFFINITY = 3;
const W_DISCOVERY = 1.5;
const W_SKIP = 2;
const W_REPLAY = 1;

const coldStart = (candidates: RecommendationCandidate[], limit: number): Recommendation[] => {
  // No history yet: show a varied spread — one track per artist, round-robin.
  const byArtist = new Map<string, RecommendationCandidate[]>();
  for (const c of candidates) {
    const list = byArtist.get(c.artist) ?? [];
    list.push(c);
    byArtist.set(c.artist, list);
  }

  const picks: Recommendation[] = [];
  let added = true;
  let round = 0;
  while (picks.length < limit && added) {
    added = false;
    for (const [, list] of byArtist) {
      if (list[round]) {
        const c = list[round];
        picks.push({ ...c, trackId: c.id, reason: 'Discover', score: 0 });
        added = true;
        if (picks.length >= limit) break;
      }
    }
    round++;
  }
  return picks;
};

export const useRecommendations = (
  candidates: RecommendationCandidate[],
  limit = 6
): Recommendation[] => {
  const { data } = useAnalyticsData();

  return useMemo(() => {
    if (!candidates || candidates.length === 0) return [];

    // Per-track engagement + raw per-artist affinity from analytics.
    const perTrack = new Map<string, { playCount: number; skipCount: number; completionRate: number }>();
    const artistAffinityRaw = new Map<string, number>();
    let hasHistory = false;

    if (data) {
      for (const d of data.detailedAnalytics) {
        perTrack.set(d.trackId, {
          playCount: d.playCount,
          skipCount: d.skipCount,
          completionRate: d.completionRate,
        });
        if (d.playCount > 0) hasHistory = true;

        const aff = d.playCount + (d.completionRate / 100) * 2 - d.skipCount * 0.5;
        artistAffinityRaw.set(d.artist, (artistAffinityRaw.get(d.artist) ?? 0) + aff);
      }
    }

    if (!hasHistory) {
      return coldStart(candidates, limit);
    }

    const maxAff = Math.max(1, ...Array.from(artistAffinityRaw.values()));
    const affinityOf = (artist: string) =>
      Math.max(0, artistAffinityRaw.get(artist) ?? 0) / maxAff;

    const scored: Recommendation[] = candidates.map((c) => {
      const stats = perTrack.get(c.id);
      const aff = affinityOf(c.artist);
      const played = !!stats && stats.playCount > 0;
      const discoveryBonus = played ? 0 : 1;
      const skipPenalty = stats ? Math.min(1, stats.skipCount / 3) : 0;
      const replayValue = stats && stats.completionRate >= 50 ? 0.5 : 0;

      const score =
        W_AFFINITY * aff +
        W_DISCOVERY * discoveryBonus * (aff > 0 ? 1 : 0.5) -
        W_SKIP * skipPenalty +
        W_REPLAY * replayValue;

      let reason = 'Recommended for you';
      if (!played && aff > 0) reason = `Because you like ${c.artist}`;
      else if (!played) reason = 'New to you';
      else if (replayValue > 0) reason = 'Play it again';
      else if (aff > 0) reason = `More from ${c.artist}`;

      return { ...c, trackId: c.id, reason, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }, [candidates, data, limit]);
};
