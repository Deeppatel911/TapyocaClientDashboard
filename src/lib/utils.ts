import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format titles by removing leading numbers and replacing underscores/hyphens with spaces
export function formatTitle(raw: string): string {
  if (!raw) return '';
  // Remove leading numbers and optional separators
  const noPrefix = raw.replace(/^\s*\d+[\s_-]*/,'');
  // Replace underscores and hyphens with spaces, collapse multiple spaces, trim
  return noPrefix.replace(/[\-_]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

