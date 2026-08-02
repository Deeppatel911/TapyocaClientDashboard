import { useMemo } from 'react';
import { useAnalyticsData } from './useAnalyticsData';
import { useTrackDirectory } from './useTrackDirectory';

/**
 * Real, derived fan-rewards data.
 *
 * Achievements and points are computed live from the playback event stream
 * (via useAnalyticsData) and the storage catalog (via useTrackDirectory) — no
 * hardcoded sample data. Achievements are defined as a config list with a
 * data-driven target, so:
 *   - "catalog" achievements (Library Explorer, Tastemaker) auto-scale as more
 *     tracks/artists are added — no code change needed.
 *   - adding new achievements later (e.g. per-album once albums are linked to
 *     storage) is just another entry in ACHIEVEMENTS.
 */

export interface RewardAchievement {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
}

export type TierIcon = 'sparkles' | 'gift' | 'trophy' | 'ticket';

export interface FanTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  icon: TierIcon;
  isUnlocked: boolean;
  isCurrent: boolean;
}

// Status-based rewards: a fan's tier is *earned* purely from points, so there's
// nothing to fulfill or claim. Transactional rewards (exclusive tracks, posters,
// concert perks) are intentionally deferred to a product/founder decision.
const TIER_LADDER: Array<Omit<FanTier, 'isUnlocked' | 'isCurrent'>> = [
  { id: 'bronze', name: 'Bronze Fan', description: 'Every journey starts here', minPoints: 0, icon: 'sparkles' },
  { id: 'silver', name: 'Silver Fan', description: 'You are getting into it', minPoints: 200, icon: 'gift' },
  { id: 'gold', name: 'Gold Fan', description: 'A true supporter', minPoints: 500, icon: 'trophy' },
  { id: 'vip', name: 'VIP Fan', description: 'Top-tier superfan status', minPoints: 1000, icon: 'ticket' },
];

export interface RewardsMetrics {
  totalPlays: number;
  totalListenSeconds: number;
  totalCompletes: number;
  audioPlays: number;
  videoPlays: number;
  distinctTracksPlayed: number;
  distinctArtistsPlayed: number;
  totalTracks: number;
  totalAudioTracks: number;
  totalVideoTracks: number;
  totalArtists: number;
  // Per-artist catalog counts (ready for future per-artist achievements/stats).
  perArtist: Record<string, { tracksTotal: number; tracksAudio: number; tracksVideo: number; plays: number }>;
}

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  points: number;
  // Returns display-ready progress against a (possibly dynamic) target.
  evaluate: (m: RewardsMetrics) => { progress: number; maxProgress: number };
}

const HOURS_GOAL = 10;
const COMPLETIONIST_GOAL = 5;
const CINEPHILE_GOAL = 3;

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-listen',
    title: 'First Listen',
    description: 'Play your first track',
    points: 50,
    evaluate: (m) => ({ progress: Math.min(m.totalPlays, 1), maxProgress: 1 }),
  },
  {
    id: 'library-explorer',
    title: 'Library Explorer',
    description: 'Play every track in the catalog',
    points: 200,
    // Dynamic target — scales with the number of tracks available.
    evaluate: (m) => ({ progress: m.distinctTracksPlayed, maxProgress: m.totalTracks }),
  },
  {
    id: 'tastemaker',
    title: 'Tastemaker',
    description: 'Listen to every artist in the catalog',
    points: 200,
    // Dynamic target — scales with the number of artists available.
    evaluate: (m) => ({ progress: m.distinctArtistsPlayed, maxProgress: m.totalArtists }),
  },
  {
    id: 'dedicated-fan',
    title: 'Dedicated Fan',
    description: `Listen for ${HOURS_GOAL} hours total`,
    points: 500,
    evaluate: (m) => ({
      progress: Math.min(Math.floor(m.totalListenSeconds / 3600), HOURS_GOAL),
      maxProgress: HOURS_GOAL,
    }),
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: `Finish ${COMPLETIONIST_GOAL} tracks start to end`,
    points: 150,
    evaluate: (m) => ({ progress: Math.min(m.totalCompletes, COMPLETIONIST_GOAL), maxProgress: COMPLETIONIST_GOAL }),
  },
  {
    id: 'cinephile',
    title: 'Cinephile',
    description: `Watch ${CINEPHILE_GOAL} videos`,
    points: 150,
    evaluate: (m) => ({ progress: Math.min(m.videoPlays, CINEPHILE_GOAL), maxProgress: CINEPHILE_GOAL }),
  },
];

const emptyMetrics = (): RewardsMetrics => ({
  totalPlays: 0,
  totalListenSeconds: 0,
  totalCompletes: 0,
  audioPlays: 0,
  videoPlays: 0,
  distinctTracksPlayed: 0,
  distinctArtistsPlayed: 0,
  totalTracks: 0,
  totalAudioTracks: 0,
  totalVideoTracks: 0,
  totalArtists: 0,
  perArtist: {},
});

export const useRewardsData = () => {
  const { data, isLoading: analyticsLoading } = useAnalyticsData();
  const { directory, isLoading: directoryLoading } = useTrackDirectory();

  const metrics = useMemo<RewardsMetrics>(() => {
    const m = emptyMetrics();

    // Catalog totals from storage (what's *available*).
    const artistSet = new Set<string>();
    directory.forEach((entry) => {
      m.totalTracks += 1;
      if (entry.trackType === 'video') m.totalVideoTracks += 1;
      else m.totalAudioTracks += 1;

      artistSet.add(entry.artist);
      const a = (m.perArtist[entry.artist] ??= { tracksTotal: 0, tracksAudio: 0, tracksVideo: 0, plays: 0 });
      a.tracksTotal += 1;
      if (entry.trackType === 'video') a.tracksVideo += 1;
      else a.tracksAudio += 1;
    });
    m.totalArtists = artistSet.size;

    // Engagement totals from the event stream (what's been *played*).
    if (data) {
      m.totalPlays = data.totalPlays;
      m.totalListenSeconds = data.totalListeningTime;
      m.totalCompletes = data.completionRates.completed;

      const playedArtists = new Set<string>();
      for (const t of data.playCountsByTrack) {
        if (t.playCount <= 0) continue;
        m.distinctTracksPlayed += 1;
        playedArtists.add(t.artist);
        if (t.trackType === 'video') m.videoPlays += t.playCount;
        else m.audioPlays += t.playCount;
        if (m.perArtist[t.artist]) m.perArtist[t.artist].plays += t.playCount;
      }
      m.distinctArtistsPlayed = playedArtists.size;
    }

    return m;
  }, [data, directory]);

  const achievements = useMemo<RewardAchievement[]>(
    () =>
      ACHIEVEMENTS.map((def) => {
        const { progress, maxProgress } = def.evaluate(metrics);
        const isCompleted = maxProgress > 0 && progress >= maxProgress;
        return {
          id: def.id,
          title: def.title,
          description: def.description,
          points: def.points,
          progress: maxProgress > 0 ? Math.min(progress, maxProgress) : progress,
          maxProgress,
          isCompleted,
        };
      }),
    [metrics]
  );

  // Points are *earned* by completing achievements.
  const points = achievements.reduce((sum, a) => (a.isCompleted ? sum + a.points : sum), 0);

  // Fan tier derived purely from points.
  const tiers = useMemo<FanTier[]>(() => {
    // Highest ladder index whose threshold the user has reached.
    let currentIndex = 0;
    TIER_LADDER.forEach((t, i) => {
      if (points >= t.minPoints) currentIndex = i;
    });
    return TIER_LADDER.map((t, i) => ({
      ...t,
      isUnlocked: points >= t.minPoints,
      isCurrent: i === currentIndex,
    }));
  }, [points]);

  const currentTier = tiers.find((t) => t.isCurrent) ?? tiers[0];
  const nextTier = tiers.find((t) => !t.isUnlocked) ?? null;
  const pointsToNextTier = nextTier ? Math.max(0, nextTier.minPoints - points) : 0;

  return {
    points,
    achievements,
    tiers,
    currentTier,
    nextTier,
    pointsToNextTier,
    metrics,
    isLoading: analyticsLoading || directoryLoading,
  };
};
