
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
      <div className="h-full flex items-center justify-center px-4 pt-32 pb-20">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Shop text above image */}
          <p className="text-2xl font-bold text-music-text mb-6">Shop</p>
          
          {/* Cards image */}
          <div className="relative mb-6 p-3 rounded-xl bg-gradient-subtle/20 backdrop-blur-sm w-full">
            <img 
              src="/uploads/cards.png" 
              alt="NFC Cards"
              className="w-full h-auto object-contain mix-blend-multiply"
              style={{
                filter: 'contrast(1.1) saturate(1.2)',
                mixBlendMode: 'multiply',
                maxHeight: '280px'
              }}
            />
          </div>
          
          {/* $20 text below image */}
          <p className="text-2xl font-bold text-music-text">$20</p>
        </div>
      </div>
    </div>
  );
};
