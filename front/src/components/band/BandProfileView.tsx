import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Band, Album, Track } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Eye,
  Mail,
  Phone,
  Calendar,
  Users,
  Play,
  Pause,
  Disc3,
  Camera,
  ArrowLeft,
  Send,
  CheckCircle,
} from 'lucide-react';

interface BandProfileViewProps {
  band: Band;
  onBack: () => void;
}

export const BandProfileView: React.FC<BandProfileViewProps> = ({ band, onBack }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { requireAuth } = useAuth();

  const [isLiked, setIsLiked] = useState(band.isLiked || false);
  const [likeCount, setLikeCount] = useState(band.likeCount || 0);

  // Form de contato da banda
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleLikeBand = () => {
    requireAuth(() => {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikeCount((prev) => prev + (nextLiked ? 1 : -1));
    }, 'Crie uma conta para curtir o perfil da banda e salvar em seus favoritos!');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simula envio via Mailtrap
    setTimeout(() => {
      setIsSending(false);
      setContactSent(true);
      setMessage('');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0F1014] pb-32">
      {/* Botão Voltar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#FF5500] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Vitrine Principal</span>
        </button>
      </div>

      {/* Banner Hero da Banda */}
      <div className="relative mt-4 h-72 sm:h-96 w-full bg-[#1A1C23] overflow-hidden">
        <img
          src={band.bannerImageUrl || band.profileImageUrl || ''}
          alt={band.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1014] via-[#0F1014]/60 to-transparent" />

        {/* Detalhes sobrepostos no rodapé do banner */}
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={band.profileImageUrl || ''}
              alt={band.name}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#FF5500] shadow-glow-orange flex-shrink-0"
            />
            <div>
              <span className="inline-block bg-[#8B5CF6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                {band.genre}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#F8FAFC] font-display">
                {band.name}
              </h1>
              <div className="flex items-center gap-4 text-xs text-[#94A3B8] mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Desde {band.foundationYear}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {band.viewCount} visualizações
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Curtir Perfil */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLikeBand}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${
              isLiked
                ? 'bg-[#FF5500] text-white shadow-glow-orange'
                : 'bg-[#1A1C23] hover:bg-[#272A36] text-[#F8FAFC] border border-[#272A36]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            <span>{isLiked ? 'Banda Curtida' : 'Curtir Banda'}</span>
            <span className="bg-black/30 px-2 py-0.5 rounded-full text-[11px] ml-1">
              {likeCount}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Conteúdo Principal do Perfil */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Discografia Completa (Álbuns & Músicas) */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-display flex items-center gap-2">
                <Disc3 className="w-6 h-6 text-[#FF5500]" />
                <span>Discografia Oficial</span>
              </h2>
              <span className="text-xs text-[#94A3B8] bg-[#1A1C23] border border-[#272A36] px-3 py-1 rounded-full">
                Máx. 10 faixas por álbum
              </span>
            </div>

            {band.albums && band.albums.length > 0 ? (
              <div className="space-y-8">
                {band.albums.map((album) => (
                  <div
                    key={album.id}
                    className="bg-[#1A1C23] border border-[#272A36] rounded-2xl p-6"
                  >
                    {/* Header do Álbum */}
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#272A36]">
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-16 h-16 rounded-lg object-cover border border-[#272A36]"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC]">{album.title}</h3>
                        <p className="text-xs text-[#94A3B8]">
                          {album.releaseYear} &bull; {album.tracks?.length || 0} faixas ({album.genre})
                        </p>
                      </div>
                    </div>

                    {/* Faixas do Álbum */}
                    <div className="space-y-2">
                      {album.tracks?.map((track) => {
                        const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

                        return (
                          <div
                            key={track.id}
                            onClick={() => playTrack(track, album.tracks)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                              currentTrack?.id === track.id
                                ? 'bg-[#FF5500]/10 border border-[#FF5500]/40'
                                : 'hover:bg-[#0F1014] border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-center text-xs font-mono text-[#94A3B8]">
                                {track.trackNumber}
                              </span>
                              <button
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isCurrentPlaying
                                    ? 'bg-[#FF5500] text-white shadow-glow-orange'
                                    : 'bg-[#0F1014] text-[#94A3B8] hover:text-[#FF5500]'
                                }`}
                              >
                                {isCurrentPlaying ? (
                                  <Pause className="w-3.5 h-3.5 fill-white" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                                )}
                              </button>
                              <div>
                                <h4
                                  className={`text-xs font-bold ${
                                    currentTrack?.id === track.id
                                      ? 'text-[#FF5500]'
                                      : 'text-[#F8FAFC]'
                                  }`}
                                >
                                  {track.title}
                                </h4>
                                <span className="text-[10px] text-[#94A3B8]">
                                  {track.playCount} reproduções
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-mono text-[#94A3B8]">
                              {Math.floor(track.duration / 60)}:
                              {track.duration % 60 < 10 ? '0' : ''}
                              {track.duration % 60}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1C23] p-8 rounded-2xl border border-[#272A36] text-center">
                <Disc3 className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                <p className="text-xs text-[#94A3B8]">Nenhum álbum lançado ainda por esta banda.</p>
              </div>
            )}
          </div>

          {/* Galeria de Fotos da Banda */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-display mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#8B5CF6]" />
              <span>Galeria de Fotos do Palco</span>
            </h2>

            {band.photos && band.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {band.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-[#1A1C23] border border-[#272A36]"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || 'Foto da banda'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {photo.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] text-[#F8FAFC] font-medium leading-tight">
                          {photo.caption}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">Nenhuma foto na galeria no momento.</p>
            )}
          </div>
        </div>

        {/* Coluna Direita: Bio, Integrantes e Contato Transacional */}
        <div className="space-y-6">
          {/* Biografia */}
          <div className="bg-[#1A1C23] p-6 rounded-2xl border border-[#272A36]">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider mb-3">
              Sobre a Banda
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line">
              {band.bio}
            </p>
          </div>

          {/* Integrantes */}
          <div className="bg-[#1A1C23] p-6 rounded-2xl border border-[#272A36]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-3">
              <Users className="w-4 h-4 text-[#8B5CF6]" />
              <span>Integrantes</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line">
              {band.members}
            </p>
          </div>

          {/* Informações de Contato / Shows */}
          <div className="bg-[#1A1C23] p-6 rounded-2xl border border-[#272A36]">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">
              Contratar para Shows & Mídia
            </h3>

            <div className="space-y-3 text-xs mb-6">
              {band.contactPhone && (
                <div className="flex items-center gap-2.5 text-[#F8FAFC]">
                  <Phone className="w-4 h-4 text-[#FF5500]" />
                  <span>{band.contactPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-[#F8FAFC]">
                <Mail className="w-4 h-4 text-[#8B5CF6]" />
                <span>{band.contactEmail}</span>
              </div>
            </div>

            {/* Formulário de Contato Direto via Mailtrap */}
            {contactSent ? (
              <div className="bg-[#0F1014] p-4 rounded-xl border border-green-500/40 text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#F8FAFC]">Mensagem Enviada!</p>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  A equipe da banda recebeu seu contato por e-mail via Mailtrap.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu nome ou produtora"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3 py-2 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Seu e-mail de retorno"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3 py-2 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                />
                <textarea
                  placeholder="Proposta de show, feat ou mensagem..."
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3 py-2 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-2.5 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-glow-orange disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Enviando...' : 'Enviar Mensagem para a Banda'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
