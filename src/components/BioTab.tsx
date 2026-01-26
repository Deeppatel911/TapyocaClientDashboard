
import { HiOutlineFire } from 'react-icons/hi2';

export const BioTab = () => {
  return (
    <div className="h-screen bg-gradient-main relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <HiOutlineFire className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-music-text mb-2">MARCH FOR EQUITY</h1>
          <p className="text-sm text-music-text/70">WWW.MARCHFOREQUITY.COM</p>
        </div>
      </div>

      {/* Main Content - Centered Image, no boxes */}
      <div className="h-full flex items-center justify-center px-4 pt-20 pb-20">
        <div className="w-full max-w-md">
          <img 
            src="/uploads/de326ed3-9dbc-4546-b937-478483e55b6a.png" 
            alt="NFC Cards"
            className="w-full h-auto object-contain rounded-lg shadow-warm"
          />
        </div>
      </div>
    </div>
  );
};
