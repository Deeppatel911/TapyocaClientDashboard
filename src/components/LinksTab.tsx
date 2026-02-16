import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ArtistLink {
  id: string;
  artist_id: string;
  url: string;
  display_name: string;
  created_at: string;
  artists?: {
    id: string;
    name: string;
  };
}

export const LinksTab = () => {
  const { socialLinks, isLoading } = useSupabaseData();
  const [artistLinks, setArtistLinks] = useState<ArtistLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);

  useEffect(() => {
    const fetchArtistLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('artist_links')
          .select(`
            *,
            artists (
              id,
              name
            )
          `)
          .order('created_at', { ascending: true });

        if (error) throw error;
        console.log('Fetched artist links:', data); // Debug log
        setArtistLinks(data || []);
      } catch (error) {
        console.error('Error fetching artist links:', error);
      } finally {
        setLinksLoading(false);
      }
    };

    fetchArtistLinks();
  }, []);

  // Combine artist links with social links
  const allLinks = [
    ...artistLinks.map(link => ({
      id: link.id,
      name: link.display_name || link.artists?.name || 'Unknown Artist',
      platform: 'Instagram',
      url: link.url,
      icon: '📷'
    })),
    ...socialLinks
  ];
  
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading || linksLoading) {
    return <div className="h-screen bg-gradient-main flex items-center justify-center">
      <div className="text-music-text">Loading...</div>
    </div>;
  }

  return (
    <div className="h-screen bg-gradient-main relative overflow-hidden">
      {/* Main Content */}
      <div className="pt-20 pb-24 px-4 sm:px-6 h-full flex flex-col">
        {/* Links Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-music-text mb-2">LINKS</h2>
        </div>

        {/* Links List */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 max-w-md mx-auto">
            {allLinks.map((link) => (
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
                        {(link as any).icon || link.platform.charAt(0).toUpperCase()}
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
            ))}
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