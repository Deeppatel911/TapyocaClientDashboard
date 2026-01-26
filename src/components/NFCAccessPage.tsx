import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';

interface NFCAccessPageProps {
  onNFCTap: () => void;
}

export const NFCAccessPage = ({ onNFCTap }: NFCAccessPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-card/90 backdrop-blur-sm border-border/50 shadow-warm">
        <div className="flex justify-center mb-6">
          <HiOutlineDevicePhoneMobile className="w-20 h-20 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-music-text mb-4">
          NFC Access Required
        </h1>
        
        <p className="text-music-text/70 mb-6">
          This application requires NFC card access. Please tap your NFC card on a compatible device to continue.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={onNFCTap}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Simulate NFC Tap (Demo)
          </Button>
          
          <p className="text-xs text-music-text/50">
            In production, this would be triggered by an actual NFC tap
          </p>
        </div>
      </Card>
    </div>
  );
};