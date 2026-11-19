import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Music,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '../../services/api';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PersistentPlayer: React.FC<{ onOpenBandProfile?: (slug: string) => void }> = ({
  onOpenBandProfile,
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seek,
    setVolume,
    nextTrack,
    prevTrack,
  } = usePlayer();

  const { requireAuth } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  useEffect(() => {
    setIsLiked(currentTrack?.isLiked || false);
  }, [currentTrack?.id, currentTrack?.isLiked]);

  if (!currentTrack) {
    // Player discreto em standby caso nenhuma faixa tenha sido selecionada ainda
    return null;
  }

  const handleLikeClick = () => {
    requireAuth(async () => {
      try {
        const result = await ApiService.toggleTrackLike(currentTrack.id);
        setIsLiked(result.isLiked);
      } catch (error) {
        console.error('Falha ao salvar curtida da faixa:', error);
      }
    }, 'Crie uma conta no PalcoLivre para favoritar faixas e salvar em suas playlists!');
  };

  const handleVolumeToggle = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.8);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1C23] border-t border-[#272A36] px-4 py-3 shadow-player">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Lado Esquerdo: Capa, Título e Banda */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-[200px]">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#0F1014] flex-shrink-0 border border-[#272A36]">
            {currentTrack.coverImageUrl ? (
              <img
                src={currentTrack.coverImageUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#FF5500]">
                <Music className="w-6 h-6" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                <span className="w-1 bg-[#FF5500] h-3 animate-pulse" />
                <span className="w-1 bg-[#FF5500] h-5 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-[#FF5500] h-2 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#F8FAFC] truncate">
              {currentTrack.title}
            </h4>
            <p
              onClick={() => currentTrack.bandSlug && onOpenBandProfile?.(currentTrack.bandSlug)}
              className="text-[11px] text-[#94A3B8] hover:text-[#8B5CF6] truncate cursor-pointer transition-colors"
            >
              {currentTrack.bandName || 'Artista Independente'}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={handleLikeClick}
            className={`p-1.5 ml-1 rounded-full transition-colors ${
              isLiked ? 'text-[#FF5500]' : 'text-[#94A3B8] hover:text-[#FF5500]'
            }`}
            title="Curtir faixa"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#FF5500]' : ''}`} />
          </motion.button>
        </div>

        {/* Centro: Controles de Áudio e Linha de Tempo */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-4">
            <button
              onClick={prevTrack}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 transition-colors"
              title="Faixa anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white flex items-center justify-center shadow-glow-orange transition-all"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
            </motion.button>

            <button
              onClick={nextTrack}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 transition-colors"
              title="Próxima faixa"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Barra de Progresso Interativa */}
          <div className="w-full flex items-center gap-2 text-[10px] text-[#94A3B8] font-mono">
            <span>{formatTime(currentTime)}</span>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                seek(pos * duration);
              }}
              className="relative flex-1 h-1.5 bg-[#0F1014] rounded-full cursor-pointer group"
            >
              <div
                className="h-full bg-gradient-to-r from-[#FF5500] to-[#8B5CF6] rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <span className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-opacity" />
              </div>
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Lado Direito: Volume & Qualidade de Áudio */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleVolumeToggle}
              className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#0F1014] rounded-lg accent-[#FF5500] cursor-pointer"
            />
          </div>
          <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded border border-[#8B5CF6]/20">
            HQ 320k
          </span>
        </div>
      </div>
    </div>
  );
};
