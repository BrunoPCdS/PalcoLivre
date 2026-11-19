import { INITIAL_BANDS } from '../data/mockData';
import { Band, Album, Track, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('@palcolivre:token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }
      return data;
    } catch (error) {
      // Se a API estiver offline ou inacessível no momento, lançamos para fallback controlado
      throw error;
    }
  }

  // --- Auth ---
  static async register(payload: { name: string; email: string; password: string; role: string }) {
    try {
      return await this.request<{ data: { user: User; token: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback Demo Mock
      const mockUser: User = {
        id: 'usr-' + Date.now(),
        name: payload.name,
        email: payload.email,
        role: payload.role as any,
      };
      return { data: { user: mockUser, token: 'mock-jwt-token' } };
    }
  }

  static async login(payload: { email: string; password: string }) {
    try {
      return await this.request<{ data: { user: User; token: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const mockUser: User = {
        id: 'usr-1',
        name: 'Ouvinte PalcoLivre',
        email: payload.email,
        role: 'LISTENER',
      };
      return { data: { user: mockUser, token: 'mock-jwt-token' } };
    }
  }

  // --- Explore ---
  static async getFeatured(): Promise<{ featuredBands: Band[]; featuredAlbums: Album[] }> {
    try {
      const res = await this.request<{ data: { featuredBands: Band[]; featuredAlbums: Album[] } }>('/explore/featured');
      return res.data;
    } catch {
      return {
        featuredBands: INITIAL_BANDS.slice(0, 3),
        featuredAlbums: INITIAL_BANDS.flatMap((b) => b.albums || []).slice(0, 4),
      };
    }
  }

  static async getRecent(): Promise<{ recentBands: Band[]; recentAlbums: Album[] }> {
    try {
      const res = await this.request<{ data: { recentBands: Band[]; recentAlbums: Album[] } }>('/explore/recent');
      return res.data;
    } catch {
      return {
        recentBands: INITIAL_BANDS,
        recentAlbums: INITIAL_BANDS.flatMap((b) => b.albums || []),
      };
    }
  }

  // --- Bands ---
  static async getBandBySlug(slug: string): Promise<Band> {
    try {
      const res = await this.request<{ data: { band: Band } }>(`/bands/${slug}`);
      return res.data.band;
    } catch {
      const found = INITIAL_BANDS.find((b) => b.slug === slug);
      if (found) return found;
      return INITIAL_BANDS[0];
    }
  }

  static async createBand(payload: Partial<Band>): Promise<Band> {
    try {
      const res = await this.request<{ data: { band: Band } }>('/bands', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data.band;
    } catch {
      const newBand: Band = {
        id: 'band-' + Date.now(),
        userId: 'current-user',
        name: payload.name || 'Nova Banda',
        slug: (payload.name || 'nova-banda').toLowerCase().replace(/\s+/g, '-'),
        genre: payload.genre || 'ROCK',
        foundationYear: payload.foundationYear || 2026,
        bio: payload.bio || '',
        members: payload.members || '',
        contactPhone: payload.contactPhone || '',
        contactEmail: payload.contactEmail || '',
        profileImageUrl: payload.profileImageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        bannerImageUrl: payload.bannerImageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
        viewCount: 1,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        albums: [],
        photos: [],
      };
      INITIAL_BANDS.unshift(newBand);
      return newBand;
    }
  }

  // --- Likes (Exige Auth) ---
  static async toggleBandLike(bandId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    return this.request<{ data: { isLiked: boolean; likeCount: number } }>(`/likes/band/${bandId}`, {
      method: 'POST',
    }).then((res) => res.data);
  }

  // --- Cloudflare R2 Presigned Upload URL ---
  static async getPresignedUrl(category: string, contentType: string, fileSize: number, entityId: string) {
    return this.request<{ data: { uploadUrl: string; fileKey: string; publicUrl: string } }>('/uploads/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ category, contentType, fileSize, entityId }),
    }).then((res) => res.data);
  }
}
