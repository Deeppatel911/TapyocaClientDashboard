import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRewardsData } from '@/hooks/useRewardsData';
import {
  HiOutlineGift,
  HiOutlineTrophy,
  HiOutlineTicket,
  HiOutlineSparkles,
  HiOutlineLockClosed,
  HiOutlineCheck
} from 'react-icons/hi2';

// Rewards are now a derived Fan Tier ladder (see useRewardsData) — status is
// earned purely from points, so there's nothing to fulfill or claim.
// Transactional rewards (exclusive tracks, posters, concert perks) are
// intentionally deferred to a product/founder decision.
const iconMap = {
  gift: HiOutlineGift,
  trophy: HiOutlineTrophy,
  ticket: HiOutlineTicket,
  sparkles: HiOutlineSparkles,
};

export const RewardsTab = () => {
  // Live, derived points + achievements + fan tier from real playback analytics.
  const { points: userPoints, achievements, tiers, currentTier, nextTier, pointsToNextTier } = useRewardsData();
  const [activeSection, setActiveSection] = useState<'tiers' | 'achievements'>('tiers');

  return (
    <div className="h-screen bg-transparent relative overflow-hidden">
      {/* Header */}
      <div className="pt-16 px-4 pb-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Rewards</h1>
          <div className="flex items-center justify-center gap-2">
            <HiOutlineSparkles className="w-5 h-5 text-primary" />
            <span className="text-xl font-semibold text-primary">{userPoints} Points</span>
          </div>
        </div>

        {/* Section Toggle */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={activeSection === 'tiers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('tiers')}
          >
            <HiOutlineGift className="w-4 h-4 mr-1" />
            Tiers
          </Button>
          <Button
            variant={activeSection === 'achievements' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('achievements')}
          >
            <HiOutlineTrophy className="w-4 h-4 mr-1" />
            Achievements
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)] px-4 pb-20">
        {activeSection === 'tiers' ? (
          <div className="space-y-3">
            {/* Progress toward the next tier */}
            {nextTier ? (
              <Card className="p-4 bg-card border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Current: {currentTier.name}
                  </span>
                  <Badge variant="outline">{userPoints} pts</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Next: {nextTier.name}</span>
                    <span>{pointsToNextTier} pts to go</span>
                  </div>
                  <Progress
                    value={
                      nextTier.minPoints > 0
                        ? Math.min(100, (userPoints / nextTier.minPoints) * 100)
                        : 100
                    }
                    className="h-2"
                  />
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-primary/10 border-primary/30">
                <div className="flex items-center gap-2">
                  <HiOutlineTrophy className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Top tier reached — {currentTier.name}!
                  </span>
                </div>
              </Card>
            )}

            {/* Tier ladder */}
            {tiers.map((tier) => {
              const IconComponent = iconMap[tier.icon];

              return (
                <Card
                  key={tier.id}
                  className={`p-4 ${
                    tier.isCurrent
                      ? 'bg-primary/10 border-primary'
                      : tier.isUnlocked
                        ? 'bg-card border-primary/30'
                        : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${tier.isUnlocked ? 'bg-primary/20' : 'bg-muted'}`}>
                      {tier.isUnlocked ? (
                        <IconComponent className="w-6 h-6 text-primary" />
                      ) : (
                        <HiOutlineLockClosed className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${tier.isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {tier.name}
                        </h3>
                        <Badge variant={tier.isUnlocked ? 'outline' : 'secondary'}>
                          {tier.minPoints} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {tier.description}
                      </p>

                      {tier.isCurrent ? (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          <HiOutlineCheck className="w-3 h-3 mr-1" />
                          Current tier
                        </Badge>
                      ) : tier.isUnlocked ? (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          <HiOutlineCheck className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Need {Math.max(0, tier.minPoints - userPoints)} more pts
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id}
                className={`p-4 ${
                  achievement.isCompleted 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.isCompleted ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <HiOutlineTrophy className={`w-6 h-6 ${
                      achievement.isCompleted ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">
                        {achievement.title}
                      </h3>
                      <Badge variant={achievement.isCompleted ? 'default' : 'outline'}>
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress
                        value={achievement.maxProgress > 0 ? (achievement.progress / achievement.maxProgress) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    
                    {achievement.isCompleted && (
                      <Badge variant="secondary" className="mt-2 bg-primary/20 text-primary">
                        <HiOutlineCheck className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
