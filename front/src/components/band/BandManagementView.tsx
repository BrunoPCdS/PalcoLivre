import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Music,
  Disc3,
  Settings,
  UploadCloud,
  Plus,
  Trash2,
  Save,
  Play,
  Pause,
  ExternalLink,
  Shield,
  Instagram,
  Youtube,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Band, Album, Track, MusicGenre } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { ApiService } from '../../services/api';
import { ImageUploadField } from '../common/ImageUploadField';
import { AudioUploadField } from '../common/AudioUploadField';

interface BandManagementViewProps {
  band: Band;
  onBack: () => void;
  onBandUpdated: (updatedBand: Band) => void;
  onViewPublicProfile: (slug: string) => void;
}

export const BandManagementView: React.FC<BandManagementViewProps> = ({
  band: initialBand,
  onBack,
  onBandUpdated,
  onViewPublicProfile,
}) => {
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [activeTab, setActiveTab] = useState<'details' | 'music'>('details');
  const [band, setBand] = useState<Band>(initialBand);

  // Form states - Band details
  const [name, setName] = useState(initialBand.name);
  const [genre, setGenre] = useState<MusicGenre>(initialBand.genre);
  const [foundationYear, setFoundationYear] = useState(initialBand.foundationYear);
  const [bio, setBio] = useState(initialBand.bio);
  const [members, setMembers] = useState(initialBand.members);
  const [contactPhone, setContactPhone] = useState(initialBand.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(initialBand.contactEmail);
  const [instagramUrl, setInstagramUrl] = useState(initialBand.instagramUrl || '');
  const [spotifyUrl, setSpotifyUrl] = useState(initialBand.spotifyUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialBand.youtubeUrl || '');
  const [profileImageUrl, setProfileImageUrl] = useState(initialBand.profileImageUrl || '');
  const [bannerImageUrl, setBannerImageUrl] = useState(initialBand.bannerImageUrl || '');

  // UI status
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsFeedback, setDetailsFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Album creation modal state
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumYear, setNewAlbumYear] = useState(new Date().getFullYear());
  const [newAlbumGenre, setNewAlbumGenre] = useState<MusicGenre>(initialBand.genre);
  const [newAlbumCoverUrl, setNewAlbumCoverUrl] = useState('');
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState('');
  const [editAlbumCoverUrl, setEditAlbumCoverUrl] = useState('');

  // Track addition inline state
  const [selectedAlbumIdForTrack, setSelectedAlbumIdForTrack] = useState<string | null>(null);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackAudioUrl, setNewTrackAudioUrl] = useState('');
  const [newTrackR2Key, setNewTrackR2Key] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState(180);
  const [isSavingTrack, setIsSavingTrack] = useState(false);
  const [trackFeedback, setTrackFeedback] = useState<string | null>(null);

  useEffect(() => {
    setBand(initialBand);
    setName(initialBand.name);
    setGenre(initialBand.genre);
    setFoundationYear(initialBand.foundationYear);
    setBio(initialBand.bio);
    setMembers(initialBand.members);
    setContactPhone(initialBand.contactPhone || '');
    setContactEmail(initialBand.contactEmail);
    setInstagramUrl(initialBand.instagramUrl || '');
    setSpotifyUrl(initialBand.spotifyUrl || '');
    setYoutubeUrl(initialBand.youtubeUrl || '');
    setProfileImageUrl(initialBand.profileImageUrl || '');
    setBannerImageUrl(initialBand.bannerImageUrl || '');
  }, [initialBand]);

  // Recarregar dados completos da banda se necessário
  const refreshBandData = async () => {
    try {
      const refreshed = await ApiService.getBandBySlug(band.slug);
      setBand(refreshed);
      onBandUpdated(refreshed);
    } catch (err) {
      console.warn('Erro ao atualizar dados da banda:', err);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);
    setDetailsFeedback(null);

    try {
      const payload: Partial<Band> = {
        name,
        genre,
        foundationYear: Number(foundationYear),
        bio,
        members,
        contactPhone,
        contactEmail,
        instagramUrl: instagramUrl || null,
        spotifyUrl: spotifyUrl || null,
        youtubeUrl: youtubeUrl || null,
        profileImageUrl: profileImageUrl || null,
        bannerImageUrl: bannerImageUrl || null,
      };

      const updated = await ApiService.updateBand(band.id, payload);
      setBand(updated);
      onBandUpdated(updated);
      setDetailsFeedback({ type: 'success', msg: 'Dados cadastrais e fotos da banda atualizados com sucesso!' });
    } catch (err: any) {
      setDetailsFeedback({ type: 'error', msg: err.message || 'Erro ao atualizar dados da banda.' });
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    if (!newAlbumCoverUrl) {
      alert('Envie a imagem da capa do álbum antes de publicar.');
      return;
    }

    setIsSavingAlbum(true);
    try {
      await ApiService.createAlbum({
        bandId: band.id,
        title: newAlbumTitle,
        releaseYear: Number(newAlbumYear),
        genre: newAlbumGenre,
        coverImageUrl: newAlbumCoverUrl,
      });

      await refreshBandData();
      setIsCreatingAlbum(false);
      setNewAlbumTitle('');
      setNewAlbumCoverUrl('');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar álbum.');
    } finally {
      setIsSavingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este álbum e todas as suas faixas?')) return;

    try {
      await ApiService.deleteAlbum(albumId);
      await refreshBandData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir álbum.');
    }
  };

  const handleUpdateAlbum = async (album: Album) => {
    try {
      await ApiService.updateAlbum(album.id, {
        title: editAlbumTitle.trim(),
        coverImageUrl: editAlbumCoverUrl,
      });
      setEditingAlbumId(null);
      await refreshBandData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar o álbum.');
    }
  };

  const handleAddTrack = async (albumId: string) => {
    if (!newTrackTitle.trim() || !newTrackAudioUrl || !newTrackR2Key) {
      setTrackFeedback('Por favor, faça o upload do arquivo MP3 e informe o título da faixa.');
      return;
    }

    setIsSavingTrack(true);
    setTrackFeedback(null);

    try {
      await ApiService.addTrack(albumId, {
        title: newTrackTitle.trim(),
        duration: newTrackDuration,
        audioUrl: newTrackAudioUrl,
        r2Key: newTrackR2Key,
      });

      await refreshBandData();
      setSelectedAlbumIdForTrack(null);
      setNewTrackTitle('');
      setNewTrackAudioUrl('');
      setNewTrackR2Key('');
      setNewTrackDuration(180);
    } catch (err: any) {
      setTrackFeedback(err.message || 'Erro ao adicionar faixa ao álbum.');
    } finally {
      setIsSavingTrack(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!window.confirm('Deseja excluir esta faixa MP3? O arquivo será removido do bucket Cloudflare R2.')) return;

    try {
      await ApiService.deleteTrack(trackId);
      await refreshBandData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir faixa.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1014] text-[#F8FAFC] pb-32">
      {/* Top Header Navigation */}
      <div className="border-b border-[#272A36] bg-[#1A1C23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#0F1014] hover:bg-[#272A36] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors border border-[#272A36]"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/30">
                  Painel de Gestão da Banda
                </span>
                <span className="text-xs text-[#94A3B8]">Dono: {user?.name}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-display text-[#F8FAFC]">
                {band.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewPublicProfile(band.slug)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F1014] hover:bg-[#272A36] text-[#8B5CF6] hover:text-white border border-[#272A36] text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Perfil Público</span>
            </button>
          </div>
        </div>

        {/* Abas de Navegação do Painel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 border-t border-[#272A36]/60">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'details'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Dados Cadastrais & Mídia</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'music'
                ? 'border-[#FF5500] text-[#FF5500]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Disc3 className="w-4 h-4" />
            <span>Álbuns & Músicas (MP3 / R2)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#272A36] text-[#94A3B8]">
              {band.albums?.length || 0}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ABA 1: DADOS CADASTRAIS & MÍDIA */}
        {activeTab === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Formulário Principal */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSaveDetails} className="bg-[#1A1C23] border border-[#272A36] rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#272A36]">
                  <div>
                    <h2 className="text-base font-bold text-[#F8FAFC]">
                      Editar Informações Cadastrais
                    </h2>
                    <p className="text-xs text-[#94A3B8]">
                      Atualize o perfil público da banda visível para ouvintes e produtores
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingDetails}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold shadow-glow-orange transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingDetails ? 'Salvando...' : 'Salvar Alterações'}</span>
                  </button>
                </div>

                {detailsFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      detailsFeedback.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}
                  >
                    {detailsFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{detailsFeedback.msg}</span>
                  </div>
                )}

                {/* Nome & Estilo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                      Nome da Banda *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                      Gênero Musical *
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value as MusicGenre)}
                      className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#8B5CF6] focus:outline-none"
                    >
                      <option value="ROCK">Rock</option>
                      <option value="INDIE">Indie</option>
                      <option value="METAL">Metal</option>
                      <option value="MPB">MPB</option>
                      <option value="POP">Pop</option>
                      <option value="PUNK">Punk</option>
                      <option value="HIP_HOP">Hip-Hop</option>
                      <option value="REGGAE">Reggae</option>
                      <option value="BLUES">Blues</option>
                      <option value="ELECTRONIC">Electronic</option>
                      <option value="OTHER">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Ano de Fundação */}
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Ano de Fundação *
                  </label>
                  <input
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    required
                    value={foundationYear}
                    onChange={(e) => setFoundationYear(Number(e.target.value))}
                    className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                  />
                </div>

                {/* Biografia */}
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Biografia / Trajetória da Banda *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none resize-none"
                  />
                </div>

                {/* Integrantes */}
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Integrantes e Instrumentos *
                  </label>
                  <input
                    type="text"
                    required
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                  />
                </div>

                {/* Contatos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F8FAFC] mb-1 flex items-center gap-1">
                      <span>Telefone de Contato</span>
                      <span title="Criptografado AES-256"><Shield className="w-3 h-3 text-[#FF5500]" /></span>
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                      E-mail de Contato *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-2">
                    Redes Sociais da Banda
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                      <input
                        type="text"
                        placeholder="Instagram (@ ou link)"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] pl-8 pr-3 py-2 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                      />
                    </div>

                    <div className="relative">
                      <Radio className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                      <input
                        type="text"
                        placeholder="Spotify URL"
                        value={spotifyUrl}
                        onChange={(e) => setSpotifyUrl(e.target.value)}
                        className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] pl-8 pr-3 py-2 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                      />
                    </div>

                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                      <input
                        type="text"
                        placeholder="YouTube URL"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] pl-8 pr-3 py-2 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Coluna Direita: Uploads de Mídia (Avatar e Banner via Cloudflare R2) */}
            <div className="space-y-6">
              <div className="bg-[#1A1C23] border border-[#272A36] rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#272A36]">
                  <UploadCloud className="w-5 h-5 text-[#FF5500]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#F8FAFC]">
                      Mídia e Fotos (Cloudflare R2)
                    </h3>
                    <p className="text-[11px] text-[#94A3B8]">
                      Envio direto para armazenamento em nuvem de alta performance
                    </p>
                  </div>
                </div>

                {/* Upload Foto de Perfil */}
                <ImageUploadField
                  label="Foto de Perfil (Avatar / Logo)"
                  category="avatar"
                  currentUrl={profileImageUrl}
                  aspect="square"
                  helperText="Envie a foto ou logotipo oficial da banda. Preview instantâneo e upload direto no Cloudflare R2."
                  onUploadSuccess={(url) => setProfileImageUrl(url)}
                />

                {/* Upload Banner de Capa */}
                <ImageUploadField
                  label="Banner de Capa (Show / Palco)"
                  category="banner"
                  currentUrl={bannerImageUrl}
                  aspect="banner"
                  helperText="Banner horizontal panorâmico para o topo do perfil."
                  onUploadSuccess={(url) => setBannerImageUrl(url)}
                />

                <div className="border-t border-[#272A36] pt-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#F8FAFC]">Galeria de Fotos do Palco</h4>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Envie várias fotos; cada envio é salvo na galeria pública da banda.</p>
                  </div>
                  <ImageUploadField
                    label="Adicionar foto à galeria"
                    category="gallery"
                    aspect="square"
                    entityId={band.id}
                    helperText="Cada imagem enviada será adicionada à galeria."
                    onUploadSuccess={async (url) => {
                      try {
                        await ApiService.addBandPhoto(band.id, url);
                        await refreshBandData();
                      } catch (err: any) {
                        setDetailsFeedback({ type: 'error', msg: err.message || 'Não foi possível salvar a foto na galeria.' });
                      }
                    }}
                  />
                  {!!band.photos?.length && (
                    <div className="grid grid-cols-3 gap-2">
                      {band.photos.map((photo) => (
                        <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[#272A36]">
                          <img src={photo.imageUrl} alt={photo.caption || 'Foto da banda'} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await ApiService.deleteBandPhoto(band.id, photo.id);
                                await refreshBandData();
                              } catch (err: any) {
                                setDetailsFeedback({ type: 'error', msg: err.message || 'Não foi possível remover a foto.' });
                              }
                            }}
                            className="absolute top-1 right-1 p-1.5 rounded-md bg-black/75 text-white hover:text-red-400"
                            title="Remover foto da galeria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#0F1014] rounded-xl border border-[#272A36] text-[11px] text-[#94A3B8] space-y-1">
                  <span className="font-bold text-[#F8FAFC] block">Dica de Produtor:</span>
                  <p>
                    Fotos com iluminação de palco aumentam a taxa de curtidas e reproduções em até 40% na plataforma PalcoLivre.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ABA 2: GESTÃO DE ÁLBUNS E MÚSICAS (MP3) */}
        {activeTab === 'music' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header da Seção de Álbuns */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1C23] border border-[#272A36] p-6 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-[#FF5500]" />
                  <span>Discografia e Gerenciamento de Álbuns</span>
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Faça upload de faixas de áudio MP3 (via Cloudflare R2) e organize seus lançamentos
                </p>
              </div>

              <button
                onClick={() => setIsCreatingAlbum(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold transition-all shadow-glow-orange hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Álbum</span>
              </button>
            </div>

            {/* Modal de Criação de Álbum */}
            <AnimatePresence>
              {isCreatingAlbum && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-[#1A1C23] border border-[#272A36] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#272A36]">
                      <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                        <Disc3 className="w-5 h-5 text-[#FF5500]" />
                        <span>Publicar Novo Álbum</span>
                      </h3>
                      <button
                        onClick={() => setIsCreatingAlbum(false)}
                        className="text-[#94A3B8] hover:text-white p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateAlbum} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                          Título do Álbum / EP *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Sons da Madrugada"
                          value={newAlbumTitle}
                          onChange={(e) => setNewAlbumTitle(e.target.value)}
                          className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                            Ano de Lançamento *
                          </label>
                          <input
                            type="number"
                            required
                            min={1950}
                            max={new Date().getFullYear() + 1}
                            value={newAlbumYear}
                            onChange={(e) => setNewAlbumYear(Number(e.target.value))}
                            className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                            Estilo do Álbum *
                          </label>
                          <select
                            value={newAlbumGenre}
                            onChange={(e) => setNewAlbumGenre(e.target.value as MusicGenre)}
                            className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#8B5CF6] focus:outline-none"
                          >
                            <option value="ROCK">Rock</option>
                            <option value="INDIE">Indie</option>
                            <option value="METAL">Metal</option>
                            <option value="MPB">MPB</option>
                            <option value="POP">Pop</option>
                            <option value="PUNK">Punk</option>
                            <option value="HIP_HOP">Hip-Hop</option>
                            <option value="REGGAE">Reggae</option>
                            <option value="BLUES">Blues</option>
                            <option value="ELECTRONIC">Electronic</option>
                            <option value="OTHER">Outro</option>
                          </select>
                        </div>
                      </div>

                      {/* Upload Capa do Álbum via R2 */}
                      <ImageUploadField
                        label="Capa do Álbum (Cloudflare R2)"
                        category="album-cover"
                        currentUrl={newAlbumCoverUrl}
                        aspect="square"
                        helperText="Selecione a arte da capa do álbum. Quadrada, alta resolução."
                        onUploadSuccess={(url) => setNewAlbumCoverUrl(url)}
                      />

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#272A36]">
                        <button
                          type="button"
                          onClick={() => setIsCreatingAlbum(false)}
                          className="px-4 py-2 text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingAlbum}
                          className="px-5 py-2 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold shadow-glow-orange disabled:opacity-50"
                        >
                          {isSavingAlbum ? 'Criando Álbum...' : 'Criar Álbum'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Listagem de Álbuns e Faixas */}
            {band.albums && band.albums.length > 0 ? (
              <div className="space-y-6">
                {band.albums.map((album) => (
                  <div
                    key={album.id}
                    className="bg-[#1A1C23] border border-[#272A36] rounded-2xl overflow-hidden p-6 space-y-6"
                  >
                    {/* Header do Álbum */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272A36]">
                      <div className="flex items-center gap-4">
                        <img
                          src={album.coverImageUrl}
                          alt={album.title}
                          className="w-16 h-16 rounded-xl object-cover border border-[#272A36] shadow"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 mb-1 inline-block">
                            {album.genre}
                          </span>
                          <h3 className="text-base font-bold text-[#F8FAFC]">{album.title}</h3>
                          <p className="text-xs text-[#94A3B8]">
                            Ano: {album.releaseYear} • {album.tracks?.length || 0}/10 faixas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAlbumId(editingAlbumId === album.id ? null : album.id);
                            setEditAlbumTitle(album.title);
                            setEditAlbumCoverUrl(album.coverImageUrl);
                          }}
                          className="p-2 text-[#94A3B8] hover:text-[#FF5500] rounded-lg"
                          title="Editar álbum e capa"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (selectedAlbumIdForTrack === album.id) {
                              setSelectedAlbumIdForTrack(null);
                            } else {
                              setSelectedAlbumIdForTrack(album.id);
                              setNewTrackTitle('');
                              setNewTrackAudioUrl('');
                              setNewTrackR2Key('');
                            }
                          }}
                          disabled={(album.tracks?.length || 0) >= 10}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#272A36] hover:bg-[#343847] text-[#F8FAFC] text-xs font-bold transition-colors disabled:opacity-40"
                          title={(album.tracks?.length || 0) >= 10 ? 'Limite de 10 faixas atingido' : 'Adicionar música'}
                        >
                          <Plus className="w-3.5 h-3.5 text-[#FF5500]" />
                          <span>Adicionar Faixa MP3</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="p-2 text-[#94A3B8] hover:text-red-400 hover:bg-[#0F1014] rounded-lg transition-colors"
                          title="Excluir álbum"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Formulário Inline para Upload de Nova Faixa MP3 */}
                    {editingAlbumId === album.id && (
                      <div className="bg-[#0F1014] border border-[#8B5CF6]/30 rounded-xl p-4 space-y-4">
                        <label className="block text-xs font-semibold text-[#F8FAFC] space-y-1">
                          Nome do álbum
                          <input value={editAlbumTitle} onChange={(e) => setEditAlbumTitle(e.target.value)} className="w-full bg-[#1A1C23] px-3 py-2 rounded-lg border border-[#272A36]" />
                        </label>
                        <ImageUploadField label="Alterar capa do álbum" category="album-cover" currentUrl={editAlbumCoverUrl} entityId={album.id} aspect="square" onUploadSuccess={setEditAlbumCoverUrl} />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingAlbumId(null)} className="px-3 py-2 text-xs text-[#94A3B8]">Cancelar</button>
                          <button type="button" onClick={() => handleUpdateAlbum(album)} disabled={!editAlbumTitle.trim() || !editAlbumCoverUrl} className="px-4 py-2 text-xs font-bold rounded-full bg-[#FF5500] disabled:opacity-50">Salvar alterações</button>
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {selectedAlbumIdForTrack === album.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[#0F1014] border border-[#FF5500]/30 rounded-xl p-5 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FF5500] flex items-center gap-1.5">
                              <UploadCloud className="w-4 h-4" />
                              <span>Nova Faixa MP3 para "{album.title}"</span>
                            </span>
                            <button
                              onClick={() => setSelectedAlbumIdForTrack(null)}
                              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                                Nome da Música *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Ex: Distorção Urbana"
                                value={newTrackTitle}
                                onChange={(e) => setNewTrackTitle(e.target.value)}
                                className="w-full bg-[#1A1C23] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
                              />
                            </div>

                            {/* Upload Component via Cloudflare R2 */}
                            <AudioUploadField
                              albumId={album.id}
                              onAudioUploaded={(data) => {
                                setNewTrackAudioUrl(data.audioUrl);
                                setNewTrackR2Key(data.r2Key);
                                setNewTrackDuration(data.duration);
                                if (!newTrackTitle) {
                                  setNewTrackTitle(data.fileName);
                                }
                              }}
                            />

                            {trackFeedback && (
                              <p className="text-xs text-red-400 font-medium">
                                {trackFeedback}
                              </p>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => handleAddTrack(album.id)}
                                disabled={isSavingTrack || !newTrackAudioUrl}
                                className="px-5 py-2 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold shadow-glow-orange transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{isSavingTrack ? 'Salvando Faixa...' : 'Salvar Faixa no Álbum'}</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Faixas Existentes do Álbum */}
                    {album.tracks && album.tracks.length > 0 ? (
                      <div className="space-y-2">
                        {album.tracks.map((track) => {
                          const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

                          return (
                            <div
                              key={track.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-[#0F1014]/80 border border-[#272A36] hover:border-[#343847] transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 text-center text-xs font-mono text-[#94A3B8]">
                                  {track.trackNumber}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => playTrack(track, album.tracks)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isCurrentPlaying
                                      ? 'bg-[#FF5500] text-white shadow-glow-orange'
                                      : 'bg-[#1A1C23] text-[#94A3B8] hover:text-[#FF5500]'
                                  }`}
                                  title={isCurrentPlaying ? 'Pausar' : 'Reproduzir'}
                                >
                                  {isCurrentPlaying ? (
                                    <Pause className="w-3.5 h-3.5 fill-white" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                                  )}
                                </button>

                                <div>
                                  <h4 className="text-xs font-bold text-[#F8FAFC]">
                                    {track.title}
                                  </h4>
                                  <span className="text-[10px] text-[#94A3B8] flex items-center gap-2">
                                    <span>{track.playCount} reproduções</span>
                                    {track.audioUrl && (
                                      <span className="text-green-400 font-mono text-[9px] flex items-center gap-0.5">
                                        • R2 Ativo
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-[#94A3B8]">
                                  {Math.floor(track.duration / 60)}:
                                  {track.duration % 60 < 10 ? '0' : ''}
                                  {track.duration % 60}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTrack(track.id)}
                                  className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-[#1A1C23] rounded-lg transition-colors"
                                  title="Excluir faixa do álbum"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 bg-[#0F1014] rounded-xl text-center border border-dashed border-[#272A36]">
                        <Music className="w-6 h-6 text-[#94A3B8] mx-auto mb-1 opacity-50" />
                        <p className="text-xs text-[#94A3B8]">Nenhuma faixa anexada a este álbum ainda.</p>
                        <p className="text-[11px] text-[#FF5500] mt-1">
                          Clique em "Adicionar Faixa MP3" para fazer o upload do áudio para o Cloudflare R2.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1C23] border border-[#272A36] rounded-2xl p-12 text-center space-y-3">
                <Disc3 className="w-10 h-10 text-[#FF5500] mx-auto opacity-60" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Nenhum Álbum Cadastrado</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  Publique o primeiro álbum ou EP da banda com até 10 faixas em MP3 de alta definição via Cloudflare R2.
                </p>
                <button
                  onClick={() => setIsCreatingAlbum(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold transition-all shadow-glow-orange"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Primeiro Álbum</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
