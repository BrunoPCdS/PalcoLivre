import React from 'react';
import { motion } from 'framer-motion';
import { Band } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { Flame, Play, Heart, Eye, Disc3, ArrowRight } from 'lucide-react';

interface FeaturedSectionProps {
  bands: Band[];
  onSelectBand: (slug: string) => void;
  onExploreMore: () => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  bands,
  onSelectBand,
  onExploreMore,
}) => {
  const { playTrack } = usePlayer();
  const { requireAuth } = useAuth();

  const handlePlayBandTopTrack = (e: React.MouseEvent, band: Band) => {
    e.stopPropagation();
    const firstAlbum = band.albums?.[0];
    const firstTrack = firstAlbum?.tracks?.[0];
    if (firstTrack) {
      playTrack(firstTrack, firstAlbum?.tracks);
    } else {
      onSelectBand(band.slug);
    }
  };

  const handleLike = (e: React.MouseEvent, band: Band) => {
    e.stopPropagation();
    requireAuth(() => {
      // Toggle like
      band.isLiked = !band.isLiked;
      band.likeCount = (band.likeCount || 0) + (band.isLiked ? 1 : -1);
    }, 'Crie uma conta para curtir e impulsionar suas bandas favoritas na vitrine Em Evidência!');
  };

  return (
    <section id="destaques" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header da Seção com Efeito Neon */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#FF5500] text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 fill-[#FF5500]" />
            <span>Mais Tocadas & Mais Curtidas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display">
            Em <span className="text-[#FF5500]">Evidência</span> no Palco
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Bandas que estão incendiando as caixas de som e conquistando a comunidade esta semana.
          </p>
        </div>

        <button
          onClick={onExploreMore}
          className="self-start md:self-auto flex items-center gap-1.5 text-xs font-bold text-[#8B5CF6] hover:text-[#FF5500] transition-colors group"
        >
          <span>Ver todas as bandas</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid Animado com Framer Motion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bands.map((band, index) => {
          const topAlbum = band.albums?.[0];

          return (
            <motion.div
              key={band.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => onSelectBand(band.slug)}
              className="relative group bg-[#1A1C23] border border-[#272A36] hover:border-[#FF5500]/60 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-glow-orange transition-all duration-300 flex flex-col justify-between"
            >
              {/* Banner Topo */}
              <div className="relative h-44 w-full overflow-hidden bg-[#0F1014]">
                <img
                  src={band.bannerImageUrl || band.profileImageUrl || ''}
                  alt={band.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C23] via-[#1A1C23]/40 to-transparent" />

                {/* Badge de Gênero */}
                <div className="absolute top-3 left-3 bg-[#8B5CF6]/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                  {band.genre}
                </div>

                {/* Botão de Curtir com micro-interação */}
                <motion.button
                  whileTap={{ scale: 1.25 }}
                  onClick={(e) => handleLike(e, band)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                    band.isLiked
                      ? 'bg-[#FF5500] text-white shadow-glow-orange'
                      : 'bg-black/40 text-white/80 hover:text-[#FF5500] hover:bg-black/60'
                  }`}
                  title="Curtir perfil da banda"
                >
                  <Heart className={`w-4 h-4 ${band.isLiked ? 'fill-white' : ''}`} />
                </motion.button>

                {/* Botão de Play animado ao centro/canto */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handlePlayBandTopTrack(e, band)}
                  className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white flex items-center justify-center shadow-glow-orange transition-all duration-200"
                  title="Ouvir melhor faixa"
                >
                  <Play className="w-5 h-5 fill-white translate-x-0.5" />
                </motion.button>
              </div>

              {/* Informações da Banda */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={band.profileImageUrl || ''}
                      alt={band.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#FF5500]/50"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#FF5500] transition-colors leading-snug">
                        {band.name}
                      </h3>
                      <span className="text-xs text-[#94A3B8]">
                        Desde {band.foundationYear}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#94A3B8] line-clamp-2 mt-2 leading-relaxed">
                    {band.bio}
                  </p>
                </div>

                {/* Informação do Álbum e Métricas */}
                <div className="mt-5 pt-4 border-t border-[#272A36] flex items-center justify-between text-xs text-[#94A3B8]">
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    <Disc3 className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                    <span className="truncate">{topAlbum?.title || 'Single'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1" title="Visualizações">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{band.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#FF5500]" title="Curtidas">
                      <Heart className="w-3.5 h-3.5 fill-[#FF5500]" />
                      <span>{band.likeCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
