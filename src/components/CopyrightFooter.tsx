import { HiOutlineHeart } from 'react-icons/hi2';

export const CopyrightFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="py-2 px-4 text-center bg-background/80 backdrop-blur-sm border-t border-border/30">
      <a 
        href="https://tapyoca.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <span>© {currentYear}</span>
        <span className="font-medium">Tapyoca</span>
        <HiOutlineHeart className="w-3 h-3 text-primary" />
      </a>
    </div>
  );
};
