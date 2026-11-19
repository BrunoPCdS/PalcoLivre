import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Music,
  Users,
  Play,
  Pause,
  ExternalLink,
  Disc3,
  Calendar,
  Eye,
  Trash2,
  Headphones,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Band, Track } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { ApiService } from '../../services/api';

interface UserProfileViewProps {
  onBack: () => void;
  onSelectBand: (slug: string) => void;
  onExplore: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onBack,
  onSelectBand,
  onExplore,
}) => {
  const { user, isBand } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [activeTab, setActiveTab] = useState<'bands' | 'tracks'>('bands');
  const [likedBands, setLikedBands] = useState<Band[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const [bandsData, tracksData] = await Promise.all([
        ApiService.getMyLikedBands(),
        ApiService.getMyLikedTracks(),
      ]);
      setLikedBands(bandsData);
      setLikedTracks(tracksData);
    } catch (err) {
      console.warn('Erro ao carregar favoritos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlikeBand = async (e: React.MouseEvent, bandId: string) => {
    e.stopPropagation();
    try {
      await ApiService.toggleBandLike(bandId);
      setLikedBands((prev) => prev.filter((b) => b.id !== bandId));
    } catch (err) {
      console.error('Erro ao desfavoritar banda:', err);
    }
  };

  const handleUnlikeTrack = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    try {
      await ApiService.toggleTrackLike(trackId);
      setLikedTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (err) {
      console.error('Erro ao desfavoritar música:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1014] text-[#F8FAFC] pb-32">
      {/* Header do Perfil */}
      <div className="relative bg-[#1A1C23] border-b border-[#272A36] pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#94A3B8] hover:text-[#FF5500] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Palco</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-[#8B5CF6] flex items-center justify-center text-3xl font-extrabold text-white shadow-glow-orange flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isBand
                        ? 'bg-[#FF5500]/10 border-[#FF5500]/40 text-[#FF5500]'
                        : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-[#8B5CF6]'
                    }`}
                  >
                    {isBand ? 'Conta de Banda (BAND)' : 'Conta de Ouvinte (USER)'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                  {user?.name}
                </h1>
                <p className="text-xs text-[#94A3B8] mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Estatísticas Rápidas de Favoritos */}
            <div className="flex items-center gap-4 bg-[#0F1014] p-3.5 rounded-2xl border border-[#272A36]">
              <div className="text-center px-4">
                <span className="block text-xl font-extrabold text-[#FF5500]">
                  {likedBands.length}
                </span>
                <span className="text-[11px] text-[#94A3B8]">Bandas Curtidas</span>
              </div>
              <div className="w-px h-8 bg-[#272A36]" />
              <div className="text-center px-4">
                <span className="block text-xl font-extrabold text-[#8B5CF6]">
                  {likedTracks.length}
                </span>
                <span className="text-[11px] text-[#94A3B8]">Músicas Favoritas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Abas Claras: Bandas Curtidas vs Músicas Favoritas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex gap-8 border-t border-[#272A36]/60 pt-4">
          <button
            onClick={() => setActiveTab('bands')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'bands'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Bandas Curtidas</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#0F1014] text-[#94A3B8]">
              {likedBands.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'tracks'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Músicas Favoritas</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#0F1014] text-[#94A3B8]">
              {likedTracks.length}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ABA 1: BANDAS CURTIDAS */}
        {activeTab === 'bands' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {likedBands.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedBands.map((band) => (
                  <div
                    key={band.id}
                    onClick={() => onSelectBand(band.slug)}
                    className="group bg-[#1A1C23] border border-[#272A36] rounded-2xl overflow-hidden hover:border-[#FF5500]/50 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Imagem de Capa/Banner */}
                    <div className="relative h-40 bg-[#0F1014] overflow-hidden">
                      <img
                        src={band.bannerImageUrl || band.profileImageUrl || ''}
                        alt={band.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C23] via-black/40 to-transparent" />

                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => handleUnlikeBand(e, band.id)}
                          title="Desfavoritar banda"
                          className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-[#FF5500] hover:scale-110 transition-all"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-4 flex items-center gap-3">
                        <img
                          src={band.profileImageUrl || ''}
                          alt={band.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-[#FF5500] shadow-md flex-shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white">
                            {band.genre}
                          </span>
                          <h3 className="text-base font-bold text-[#F8FAFC] leading-snug">
                            {band.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Informações da Banda */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-[#94A3B8] line-clamp-2">
                        {band.bio}
                      </p>

                      <div className="pt-2 border-t border-[#272A36] flex items-center justify-between text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Desde {band.foundationYear}
                        </span>

                        <span className="text-[#FF5500] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Acessar Palco</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1C23] border border-[#272A36] rounded-2xl p-12 text-center space-y-3">
                <Users className="w-12 h-12 text-[#94A3B8] mx-auto opacity-40" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Nenhuma Banda Curtida Ainda</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  Apoie a cena independente favoritando bandas autorais para acompanhar novidades e lançamentos.
                </p>
                <button
                  onClick={onExplore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold transition-all shadow-glow-orange"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explorar Bandas em Evidência</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ABA 2: MÚSICAS FAVORITAS */}
        {activeTab === 'tracks' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {likedTracks.length > 0 ? (
              <div className="bg-[#1A1C23] border border-[#272A36] rounded-2xl p-4 sm:p-6 space-y-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#272A36] text-xs font-bold text-[#94A3B8] px-3">
                  <span>Faixa & Artista</span>
                  <span>Duração & Ações</span>
                </div>

                {likedTracks.map((track) => {
                  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

                  return (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        currentTrack?.id === track.id
                          ? 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/40'
                          : 'hover:bg-[#0F1014] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Botão Play Rápido */}
                        <button
                          onClick={() => playTrack(track, likedTracks)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                            isCurrentPlaying
                              ? 'bg-[#8B5CF6] text-white shadow-glow-purple'
                              : 'bg-[#0F1014] text-[#94A3B8] hover:text-[#8B5CF6] border border-[#272A36]'
                          }`}
                          title={isCurrentPlaying ? 'Pausar' : 'Reproduzir agora'}
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          )}
                        </button>

                        {/* Capa do Álbum */}
                        {track.coverImageUrl && (
                          <img
                            src={track.coverImageUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-lg object-cover border border-[#272A36] flex-shrink-0"
                          />
                        )}

                        {/* Título & Banda */}
                        <div className="min-w-0">
                          <h4
                            className={`text-xs font-bold truncate ${
                              currentTrack?.id === track.id ? 'text-[#8B5CF6]' : 'text-[#F8FAFC]'
                            }`}
                          >
                            {track.title}
                          </h4>

                          {track.bandSlug ? (
                            <button
                              onClick={() => onSelectBand(track.bandSlug!)}
                              className="text-[11px] text-[#94A3B8] hover:text-[#FF5500] truncate block transition-colors text-left"
                            >
                              {track.bandName || 'Banda Independente'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8] block truncate">
                              {track.bandName || 'Banda Independente'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Duração & Botão Desfavoritar */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs font-mono text-[#94A3B8]">
                          {Math.floor(track.duration / 60)}:
                          {track.duration % 60 < 10 ? '0' : ''}
                          {track.duration % 60}
                        </span>

                        <button
                          onClick={(e) => handleUnlikeTrack(e, track.id)}
                          className="p-1.5 text-[#FF5500] hover:text-red-400 hover:bg-[#0F1014] rounded-lg transition-colors"
                          title="Desfavoritar música"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#1A1C23] border border-[#272A36] rounded-2xl p-12 text-center space-y-3">
                <Music className="w-12 h-12 text-[#94A3B8] mx-auto opacity-40" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Nenhuma Música Favoritada</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  Enquanto ouve álbuns no PalcoLivre, clique no coração para salvar suas músicas favoritas nesta playlist pessoal.
                </p>
                <button
                  onClick={onExplore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition-all shadow-glow-purple"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Explorar e Ouvir Músicas</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
