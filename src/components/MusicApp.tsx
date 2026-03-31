import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioPlayer } from './AudioPlayer';
import { VideoPlayer } from './VideoPlayer';
import { BioTab } from './BioTab';
import { LinksTab } from './LinksTab';
import { RewardsTab } from './RewardsTab';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { NFCAccessPage } from './NFCAccessPage';
import { UserProfile } from './UserProfile';
import { SearchComponent } from './SearchComponent';
import { DownloadPrevention } from './DownloadPrevention';
import { CopyrightFooter } from './CopyrightFooter';
import { useNFCAccess } from '@/hooks/useNFCAccess';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData, AudioTrack, VideoTrack } from '@/hooks/useSupabaseData';
import { HiOutlineMusicalNote, HiOutlineVideoCamera, HiOutlineUser, HiOutlineLink, HiOutlineArrowRightOnRectangle, HiOutlineCog6Tooth, HiOutlineMagnifyingGlass, HiOutlineGift, HiOutlineChartBar } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';

export const MusicApp = () => {
  const [activeTab, setActiveTab] = useState('audio');
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playingFromSearch, setPlayingFromSearch] = useState(false);
  
  const { hasAccess, isLoading, simulateNFCTap } = useNFCAccess();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleTrackSelect = (track: AudioTrack | VideoTrack, type: 'audio' | 'video', index?: number, fromSearch: boolean = false) => {
    setPlayingFromSearch(fromSearch);
    
    if (index !== undefined) {
      setCurrentTrackIndex(index);
    }
    
    // Handle tab switching
    if (fromSearch) {
      // From search: switch to tab
      setActiveTab(type);
    } else {
      // From playlist: switch to tab
      setActiveTab(type);
    }
    
    setShowSearch(false);
  };

  const handlePlayStateChange = (playing: boolean, playerType: 'audio' | 'video') => {
    setIsPlaying(playing);
  };

  const handleTimeUpdate = (current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
  };

  if (isLoading) {
    return <div className="h-screen bg-gradient-main flex items-center justify-center">
      <div className="text-music-text">Loading...</div>
    </div>;
  }

  if (!hasAccess) {
    return <NFCAccessPage onNFCTap={simulateNFCTap} />;
  }

  if (showProfile) {
    return <UserProfile onClose={() => setShowProfile(false)} />;
  }

  if (showSearch) {
    return <SearchComponent 
      onClose={() => setShowSearch(false)} 
      onAudioPlay={(track, playlist, index, fromSearch) => {
        handleTrackSelect(track, 'audio', index, fromSearch);
        setIsPlaying(true);
      }}
      onVideoPlay={(track, playlist, index, fromSearch) => {
        handleTrackSelect(track, 'video', index, fromSearch);
        setIsPlaying(true);
      }}
      onTabChange={setActiveTab}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <DownloadPrevention />
      
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(true)}
            className="text-music-text hover:text-primary"
          >
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-music-text">Fan Dashboard</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProfile(true)}
            className="text-music-text hover:text-primary"
          >
            <HiOutlineCog6Tooth className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-music-text hover:text-primary"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="max-w-md mx-auto bg-transparent min-h-screen relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="audio" className="mt-0 pb-24">
            <AudioPlayer 
              onTrackPlay={(track, index) => {
                handleTrackSelect(track, 'audio', index);
                setIsPlaying(true);
              }}
              onPlayStateChange={(playing) => handlePlayStateChange(playing, 'audio')}
              onTimeUpdate={handleTimeUpdate}
            />
          </TabsContent>
          <TabsContent value="video" className="mt-0 pb-24">
            <VideoPlayer 
              onTrackPlay={(track, index) => {
                handleTrackSelect(track, 'video', index);
                setIsPlaying(true);
              }}
              onPlayStateChange={(playing) => handlePlayStateChange(playing, 'video')}
              onTimeUpdate={handleTimeUpdate}
            />
          </TabsContent>
          <TabsContent value="bio" className="mt-0 pb-24">
            <BioTab />
          </TabsContent>
          <TabsContent value="links" className="mt-0 pb-24">
            <LinksTab />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0 pb-24">
            <AnalyticsDashboard />
          </TabsContent>
          <TabsContent value="rewards" className="mt-0 pb-24">
            <RewardsTab />
          </TabsContent>
          
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <CopyrightFooter />
            <div className="bg-gradient-dark/95 backdrop-blur-sm border-t border-border/50">
              <TabsList className="w-full h-14 sm:h-16 bg-transparent grid grid-cols-6 gap-0 rounded-none border-0 p-0">
                <TabsTrigger 
                  value="audio" 
                  className="flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:font-semibold text-muted-foreground transition-all duration-300 hover:bg-primary/10"
                >
                  <HiOutlineMusicalNote className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Audio</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:font-semibold text-muted-foreground transition-all duration-300 hover:bg-primary/10"
                >
                  <HiOutlineVideoCamera className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Video</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="bio" 
                  className="flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:font-semibold text-muted-foreground transition-all duration-300 hover:bg-primary/10"
                >
                  <HiOutlineUser className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Bio</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="links" 
                  className="flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:font-semibold text-muted-foreground transition-all duration-300 hover:bg-primary/10"
                >
                  <HiOutlineLink className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Links</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:font-semibold text-muted-foreground transition-all duration-300 hover:bg-primary/10"
                >
                  <HiOutlineChartBar className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="rewards" 
                  className="flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:font-semibold text-muted-foreground transition-all duration-300 hover:bg-primary/10"
                >
                  <HiOutlineGift className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Rewards</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
