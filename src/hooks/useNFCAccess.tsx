import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNFCAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNFCAccess = async () => {
      try {
        // Check if there's a valid session token in localStorage
        const sessionToken = localStorage.getItem('nfc_session_token');
        
        if (!sessionToken) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Verify the session token with Supabase
        const { data, error } = await supabase
          .from('nfc_sessions')
          .select('*')
          .eq('session_token', sessionToken)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          localStorage.removeItem('nfc_session_token');
          setHasAccess(false);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('NFC access check failed:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkNFCAccess();
  }, []);

  const simulateNFCTap = async () => {
    try {
      // Generate a session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours validity

      // Insert session into database
      const { error } = await supabase
        .from('nfc_sessions')
        .insert({
          session_token: sessionToken,
          card_id: 'demo-card-001',
          expires_at: expiresAt.toISOString()
        });

      if (!error) {
        localStorage.setItem('nfc_session_token', sessionToken);
        setHasAccess(true);
      }
    } catch (error) {
      console.error('NFC tap simulation failed:', error);
    }
  };

  return {
    hasAccess,
    isLoading,
    simulateNFCTap
  };
};