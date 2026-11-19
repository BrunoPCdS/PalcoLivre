import React from 'react';
import { motion } from 'framer-motion';
import { Band } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { Sparkles, Play, Clock, Music } from 'lucide-react';

interface RecentReleasesProps {
  bands: Band[];
  onSelectBand: (slug: string) => void;
}

export const RecentReleases: React.FC<RecentReleasesProps> = ({ bands, onSelectBand }) => {
  const { playTrack } = usePlayer();

  // Coleta todos os álbuns recentes com a referência da banda
  const recentAlbums = bands.flatMap((b) =>
    (b.albums || []).map((album) => ({
      ...album,
      bandName: b.name,
      bandSlug: b.slug,
      bandProfile: b.profileImageUrl,
    }))
  );

  return (
    <section id="recentes" className="py-16 bg-[#0F1014] border-t border-[#272A36]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          <span>Direto do Estúdio Independente</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display mb-8">
          Adicionadas <span className="text-[#8B5CF6]">Recentemente</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentAlbums.slice(0, 6).map((album, idx) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group bg-[#1A1C23] p-3 rounded-xl border border-[#272A36] hover:border-[#8B5CF6]/60 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Capa com overlay de Play */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#0F1014] mb-3">
                <img
                  src={album.coverImageUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => {
                    if (album.tracks && album.tracks.length > 0) {
                      playTrack(album.tracks[0], album.tracks);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white flex items-center justify-center shadow-glow-orange transition-all duration-200"
                  title="Tocar álbum"
                >
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </button>
              </div>

              <div>
                <h4
                  onClick={() => onSelectBand(album.bandSlug)}
                  className="text-xs font-bold text-[#F8FAFC] hover:text-[#FF5500] truncate cursor-pointer transition-colors"
                >
                  {album.title}
                </h4>
                <p
                  onClick={() => onSelectBand(album.bandSlug)}
                  className="text-[11px] text-[#94A3B8] hover:text-[#8B5CF6] truncate cursor-pointer transition-colors mt-0.5"
                >
                  {album.bandName}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#272A36] flex items-center justify-between text-[10px] text-[#94A3B8]">
                <span>{album.releaseYear}</span>
                <span className="text-[#8B5CF6] font-semibold">{album.genre}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
