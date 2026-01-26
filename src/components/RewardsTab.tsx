import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  HiOutlineGift, 
  HiOutlineTrophy, 
  HiOutlineTicket, 
  HiOutlineSparkles,
  HiOutlineLockClosed,
  HiOutlineCheck
} from 'react-icons/hi2';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: 'gift' | 'trophy' | 'ticket' | 'sparkles';
  isUnlocked: boolean;
  isClaimed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  points: number;
  isCompleted: boolean;
}

// Sample rewards data - in production, this would come from the database
const sampleRewards: Reward[] = [
  {
    id: '1',
    title: 'Exclusive Track',
    description: 'Unlock a bonus unreleased track',
    points: 500,
    icon: 'sparkles',
    isUnlocked: true,
    isClaimed: false,
  },
  {
    id: '2',
    title: 'Digital Poster',
    description: 'Download exclusive album artwork',
    points: 250,
    icon: 'gift',
    isUnlocked: true,
    isClaimed: true,
  },
  {
    id: '3',
    title: 'Concert Discount',
    description: '20% off next concert ticket',
    points: 1000,
    icon: 'ticket',
    isUnlocked: false,
    isClaimed: false,
  },
  {
    id: '4',
    title: 'VIP Badge',
    description: 'Earn the VIP fan badge',
    points: 2000,
    icon: 'trophy',
    isUnlocked: false,
    isClaimed: false,
  },
];

const sampleAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Listen',
    description: 'Play your first track',
    progress: 1,
    maxProgress: 1,
    points: 50,
    isCompleted: true,
  },
  {
    id: '2',
    title: 'Album Explorer',
    description: 'Listen to all tracks in the album',
    progress: 5,
    maxProgress: 10,
    points: 200,
    isCompleted: false,
  },
  {
    id: '3',
    title: 'Dedicated Fan',
    description: 'Listen for 10 hours total',
    progress: 3,
    maxProgress: 10,
    points: 500,
    isCompleted: false,
  },
  {
    id: '4',
    title: 'Share the Love',
    description: 'Share content 5 times',
    progress: 2,
    maxProgress: 5,
    points: 150,
    isCompleted: false,
  },
];

const iconMap = {
  gift: HiOutlineGift,
  trophy: HiOutlineTrophy,
  ticket: HiOutlineTicket,
  sparkles: HiOutlineSparkles,
};

export const RewardsTab = () => {
  const [userPoints] = useState(350); // In production, fetch from database
  const [rewards] = useState<Reward[]>(sampleRewards);
  const [achievements] = useState<Achievement[]>(sampleAchievements);
  const [activeSection, setActiveSection] = useState<'rewards' | 'achievements'>('rewards');

  const handleClaimReward = (rewardId: string) => {
    // In production, this would call an API to claim the reward
    console.log('Claiming reward:', rewardId);
  };

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
            variant={activeSection === 'rewards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('rewards')}
          >
            <HiOutlineGift className="w-4 h-4 mr-1" />
            Rewards
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
        {activeSection === 'rewards' ? (
          <div className="space-y-3">
            {rewards.map((reward) => {
              const IconComponent = iconMap[reward.icon];
              const canClaim = reward.isUnlocked && !reward.isClaimed && userPoints >= reward.points;
              
              return (
                <Card 
                  key={reward.id}
                  className={`p-4 ${
                    reward.isClaimed 
                      ? 'bg-muted/50 border-muted' 
                      : reward.isUnlocked 
                        ? 'bg-card border-primary/30' 
                        : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      reward.isClaimed 
                        ? 'bg-muted' 
                        : reward.isUnlocked 
                          ? 'bg-primary/20' 
                          : 'bg-muted'
                    }`}>
                      {reward.isUnlocked ? (
                        <IconComponent className={`w-6 h-6 ${
                          reward.isClaimed ? 'text-muted-foreground' : 'text-primary'
                        }`} />
                      ) : (
                        <HiOutlineLockClosed className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${
                          reward.isClaimed ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {reward.title}
                        </h3>
                        <Badge variant={reward.isClaimed ? 'secondary' : 'outline'}>
                          {reward.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {reward.description}
                      </p>
                      
                      {reward.isClaimed ? (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          <HiOutlineCheck className="w-3 h-3 mr-1" />
                          Claimed
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant={canClaim ? 'default' : 'outline'}
                          disabled={!canClaim}
                          onClick={() => handleClaimReward(reward.id)}
                        >
                          {!reward.isUnlocked 
                            ? 'Locked' 
                            : userPoints < reward.points 
                              ? `Need ${reward.points - userPoints} more pts`
                              : 'Claim Reward'
                          }
                        </Button>
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
                        value={(achievement.progress / achievement.maxProgress) * 100} 
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
