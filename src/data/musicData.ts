// Mock data for the music app
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverImage: string;
  audioUrl: string;
  hasShoppingCart?: boolean;
}

export interface VideoTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

export interface NFCCard {
  id: string;
  title: string;
  price: number;
  image: string;
  shopUrl: string;
}

export interface SocialLink {
  id: string;
  name: string;
  platform: string;
  url: string;
  icon: string;
}

export const audioTracks: Track[] = [
  {
    id: '1',
    title: 'Jersey Smoke',
    artist: 'Aaisha Truth',
    album: 'Singles',
    duration: '3:42',
    coverImage: '/uploads/5bab2fec-3797-4869-9524-adf60b69ad33.png',
    audioUrl: '/audio/jersey-smoke.mp3',
    hasShoppingCart: true
  },
  {
    id: '2',
    title: 'Ships on the Horizon',
    artist: 'Janétza',
    album: 'Ocean Dreams',
    duration: '4:15',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/ships-horizon.mp3'
  },
  {
    id: '3',
    title: 'Sweet Potato Curly Fry',
    artist: 'Caliber',
    album: 'Food Songs',
    duration: '3:28',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/sweet-potato.mp3'
  },
  {
    id: '4',
    title: 'Bangin\' On the Walls',
    artist: 'Chiara Marin',
    album: 'Walls',
    duration: '3:55',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/bangin-walls.mp3',
    hasShoppingCart: true
  },
  {
    id: '5',
    title: 'Victim And Villians',
    artist: 'K Marques',
    album: 'Duality',
    duration: '4:32',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/victim-villians.mp3'
  },
  {
    id: '6',
    title: 'Thank You',
    artist: 'jilliyeah',
    album: 'Gratitude',
    duration: '3:18',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/thank-you.mp3'
  },
  {
    id: '7',
    title: 'Treat You',
    artist: 'B.Rockk Da Wrld',
    album: 'Love Songs',
    duration: '4:05',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/treat-you.mp3'
  },
  {
    id: '8',
    title: 'You\'re The One',
    artist: 'Velvet',
    album: 'Romance',
    duration: '3:47',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/youre-the-one.mp3'
  },
  {
    id: '9',
    title: 'Night Cap',
    artist: 'Malorie',
    album: 'Evening',
    duration: '3:33',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/night-cap.mp3'
  },
  {
    id: '10',
    title: 'Focus',
    artist: 'Etheria',
    album: 'Concentration',
    duration: '4:12',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/focus.mp3'
  },
  {
    id: '11',
    title: 'Breathe',
    artist: 'Seychelle Elise',
    album: 'Mindfulness',
    duration: '3:58',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/breathe.mp3'
  },
  {
    id: '12',
    title: 'If You Don\'t Like Me',
    artist: 'Ali',
    album: 'Authenticity',
    duration: '3:25',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/if-you-dont-like-me.mp3'
  },
  {
    id: '13',
    title: 'Wish',
    artist: 'Ali Starr',
    album: 'Dreams',
    duration: '4:08',
    coverImage: '/placeholder-cover.jpg',
    audioUrl: '/audio/wish.mp3'
  }
];

export const videoTracks: VideoTrack[] = [
  {
    id: '1',
    title: 'Full Panel',
    artist: 'All Points West',
    duration: '51m',
    thumbnail: '/video-thumbnail.jpg',
    videoUrl: '/video/full-panel.mp4'
  },
  {
    id: '2',
    title: '01 - Seychelle Elise',
    artist: 'Seychelle Elise',
    duration: '5m',
    thumbnail: '/video-thumbnail.jpg',
    videoUrl: '/video/seychelle-elise.mp4'
  }
];

export const nfcCards: NFCCard[] = [
  {
    id: '1',
    title: 'Newark Tech Week 2024',
    price: 20.00,
    image: '/uploads/de8e3a1f-347b-4741-8066-f8ac9a3f6068.png',
    shopUrl: 'https://shop.example.com/nfc-card'
  }
];

export const socialLinks: SocialLink[] = [
  {
    id: '1',
    name: 'Brick City Jam',
    platform: 'Instagram',
    url: 'https://instagram.com/brickcityjam',
    icon: '📷'
  },
  {
    id: '2',
    name: 'The Knowledge House',
    platform: 'Instagram',
    url: 'https://instagram.com/theknowledgehouse',
    icon: '📷'
  },
  {
    id: '3',
    name: 'NJIT',
    platform: 'Instagram',
    url: 'https://instagram.com/njit',
    icon: '📷'
  },
  {
    id: '4',
    name: 'Newark Tech Week',
    platform: 'Instagram',
    url: 'https://instagram.com/newarktechweek',
    icon: '📷'
  },
  {
    id: '5',
    name: 'Aaisha Truth',
    platform: 'Instagram',
    url: 'https://instagram.com/aaishatruth',
    icon: '📷'
  },
  {
    id: '6',
    name: 'Ali',
    platform: 'Instagram',
    url: 'https://instagram.com/ali',
    icon: '📷'
  },
  {
    id: '7',
    name: 'Ali Starr',
    platform: 'Instagram',
    url: 'https://instagram.com/alistarr',
    icon: '📷'
  },
  {
    id: '8',
    name: 'B.Rockk Da Wrld',
    platform: 'Instagram',
    url: 'https://instagram.com/brockk',
    icon: '📷'
  },
  {
    id: '9',
    name: 'Brother Nico',
    platform: 'Instagram',
    url: 'https://instagram.com/brothernico',
    icon: '📷'
  },
  {
    id: '10',
    name: 'Caliber',
    platform: 'Instagram',
    url: 'https://instagram.com/caliber',
    icon: '📷'
  },
  {
    id: '11',
    name: 'Chad Piff',
    platform: 'Instagram',
    url: 'https://instagram.com/chadpiff',
    icon: '📷'
  },
  {
    id: '12',
    name: 'Chiara Marin',
    platform: 'Instagram',
    url: 'https://instagram.com/chiaramarin',
    icon: '📷'
  }
];