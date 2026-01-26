import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';

export const LinksTab = () => {
  const { socialLinks, isLoading } = useSupabaseData();
  
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <div className="h-screen bg-gradient-main flex items-center justify-center">
      <div className="text-music-text">Loading...</div>
    </div>;
  }

  return (
    <div className="h-screen bg-gradient-main relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="text-center">
          <h1 className="text-lg font-bold text-music-text mb-2">ALL POINTS WEST</h1>
          <p className="text-sm text-music-text/70">DISTILLERY, NEWARK NJ</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-4 sm:px-6 h-full flex flex-col">
        {/* Links Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-music-text mb-2">LINKS</h2>
        </div>

        {/* Links List */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 max-w-md mx-auto">
            {socialLinks.length > 0 ? socialLinks.map((link) => (
              <Card 
                key={link.id}
                className="p-4 bg-gradient-subtle/30 backdrop-blur-sm border-none shadow-elegant cursor-pointer transition-all duration-300 hover:shadow-warm hover:scale-[1.02] hover:bg-gradient-subtle/40 rounded-2xl"
                onClick={() => handleLinkClick(link.url)}
              >
                <div className="flex items-center gap-4">
                  {/* Platform Icon */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                      <span className="text-white text-lg font-bold">
                        {link.platform.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-music-text text-lg truncate">{link.name}</p>
                    <p className="text-music-text/60 text-sm">{link.platform}</p>
                  </div>
                  
                  {/* External Link Icon */}
                  <HiOutlineArrowTopRightOnSquare className="w-6 h-6 text-music-text/40" />
                </div>
              </Card>
            )) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineArrowTopRightOnSquare className="w-8 h-8 text-music-text/40" />
                </div>
                <p className="text-music-text/70 text-lg">No social links available</p>
                <p className="text-music-text/50 text-sm mt-2">Check back later for updates</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-music-text/70 text-sm">
            Follow these amazing artists and organizations
          </p>
        </div>
      </div>
    </div>
  );
};