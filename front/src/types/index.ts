export type UserRole = 'LISTENER' | 'BAND_MANAGER' | 'ADMIN' | 'BAND' | 'USER';

export const isBandRole = (role?: UserRole | string | null): boolean => {
  if (!role) return false;
  return role === 'BAND_MANAGER' || role === 'BAND' || role === 'ADMIN';
};

export type MusicGenre =
  | 'ROCK'
  | 'INDIE'
  | 'METAL'
  | 'MPB'
  | 'POP'
  | 'PUNK'
  | 'HIP_HOP'
  | 'REGGAE'
  | 'BLUES'
  | 'ELECTRONIC'
  | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  bands?: Array<{
    id: string;
    name: string;
    slug: string;
    profileImageUrl?: string | null;
  }>;
}

export interface Track {
  id: string;
  albumId: string;
  title: string;
  trackNumber: number;
  duration: number; // segundos
  audioUrl: string;
  r2Key?: string;
  playCount: number;
  likesCount?: number;
  isLiked?: boolean;
  bandName?: string;
  bandSlug?: string;
  coverImageUrl?: string;
}

export interface Album {
  id: string;
  bandId: string;
  title: string;
  coverImageUrl: string;
  releaseYear: number;
  genre: MusicGenre;
  tracks?: Track[];
  trackCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  band?: {
    id: string;
    name: string;
    slug: string;
    profileImageUrl?: string | null;
  };
}

export interface BandPhoto {
  id: string;
  bandId: string;
  imageUrl: string;
  caption?: string | null;
  order: number;
}

export interface Band {
  id: string;
  userId: string;
  name: string;
  slug: string;
  genre: MusicGenre;
  foundationYear: number;
  bio: string;
  members: string;
  contactPhone?: string;
  contactEmail: string;
  instagramUrl?: string | null;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  viewCount: number;
  likeCount?: number;
  albumCount?: number;
  isLiked?: boolean;
  photos?: BandPhoto[];
  albums?: Album[];
  createdAt: string;
}
