import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Band, MusicGenre } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Disc, ArrowUpRight } from 'lucide-react';

interface GenreExploreProps {
  bands: Band[];
  onSelectBand: (slug: string) => void;
}

const GENRES: Array<{ key: MusicGenre | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'Todos os Estilos' },
  { key: 'ROCK', label: 'Rock' },
  { key: 'INDIE', label: 'Indie' },
  { key: 'POP', label: 'Pop / Synth' },
  { key: 'MPB', label: 'MPB Autoral' },
  { key: 'PUNK', label: 'Punk / Hardcore' },
  { key: 'METAL', label: 'Metal' },
  { key: 'HIP_HOP', label: 'Hip-Hop' },
];

export const GenreExplore: React.FC<GenreExploreProps> = ({ bands, onSelectBand }) => {
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre | 'ALL'>('ALL');
  const { playTrack } = usePlayer();

  const filteredBands =
    selectedGenre === 'ALL'
      ? bands
      : bands.filter((b) => b.genre.toUpperCase() === selectedGenre.toUpperCase());

  return (
    <section id="estilos" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display">
          Explorar por <span className="text-[#8B5CF6]">Estilos</span>
        </h2>
        <p className="text-sm text-[#94A3B8] mt-1">
          Filtre as bandas independentes pelo gênero musical que move o seu palco.
        </p>
      </div>

      {/* Abas / Pills de Gênero */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        {GENRES.map((g) => {
          const isActive = selectedGenre === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setSelectedGenre(g.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#8B5CF6] text-white shadow-glow-purple'
                  : 'bg-[#1A1C23] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#272A36] border border-[#272A36]'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Grid de Bandas do Estilo Selecionado */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
      >
        <AnimatePresence>
          {filteredBands.map((band) => {
            const album = band.albums?.[0];
            const track = album?.tracks?.[0];

            return (
              <motion.div
                layout
                key={band.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => onSelectBand(band.slug)}
                className="bg-[#1A1C23] border border-[#272A36] hover:border-[#8B5CF6]/50 rounded-xl p-4 flex flex-col justify-between group cursor-pointer hover:shadow-glow-purple transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-[#0F1014] mb-3">
                    <img
                      src={band.profileImageUrl || ''}
                      alt={band.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {track && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track, album?.tracks);
                        }}
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white flex items-center justify-center shadow-glow-orange opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Tocar faixa de destaque"
                      >
                        <Play className="w-4 h-4 fill-white translate-x-0.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#FF5500] transition-colors leading-tight">
                      {band.name}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF5500] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                  </div>

                  <span className="inline-block text-[10px] text-[#8B5CF6] font-bold mt-1 bg-[#8B5CF6]/10 px-2 py-0.5 rounded">
                    {band.genre}
                  </span>

                  <p className="text-xs text-[#94A3B8] line-clamp-2 mt-2 leading-relaxed">
                    {band.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#272A36] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>{band.albums?.length || 0} álbuns</span>
                  <span>{band.likeCount || 0} curtidas</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredBands.length === 0 && (
        <div className="text-center py-12 bg-[#1A1C23] rounded-2xl border border-[#272A36] mt-6">
          <p className="text-sm text-[#94A3B8]">Nenhuma banda cadastrada neste estilo ainda.</p>
          <p className="text-xs text-[#FF5500] mt-1 font-bold">Seja a primeira banda deste gênero no PalcoLivre!</p>
        </div>
      )}
    </section>
  );
};
