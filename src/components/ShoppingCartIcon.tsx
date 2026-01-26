import { HiOutlineShoppingCart } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { MouseEvent } from 'react';

interface ShoppingCartIconProps {
  onClick?: (e?: MouseEvent) => void;
  className?: string;
}

export const ShoppingCartIcon = ({ onClick, className }: ShoppingCartIconProps) => {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`p-2 hover:bg-primary/10 ${className}`}
    >
      <HiOutlineShoppingCart className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
    </Button>
  );
};