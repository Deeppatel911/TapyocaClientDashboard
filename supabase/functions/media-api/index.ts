import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'GET':
        if (path === 'audio') {
          const { data: audioTracks, error } = await supabase
            .from('audio_tracks')
            .select(`
              *,
              artists (*)
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(audioTracks), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (path === 'video') {
          const { data: videoTracks, error } = await supabase
            .from('video_tracks')
            .select(`
              *,
              artists (*)
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(videoTracks), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (path === 'social-links') {
          const { data: socialLinks, error } = await supabase
            .from('social_links')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(socialLinks), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (path === 'nfc-cards') {
          const { data: nfcCards, error } = await supabase
            .from('nfc_cards')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(nfcCards), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'POST':
        if (path === 'track-play') {
          const { trackId, mediaType, userId } = await req.json();
          
          // Log play event
          await supabase.from('analytics_events').insert({
            event_type: 'track_play',
            user_id: userId,
            metadata: { track_id: trackId, media_type: mediaType }
          });

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in media-api function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});