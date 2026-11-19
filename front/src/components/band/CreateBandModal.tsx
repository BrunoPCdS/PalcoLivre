import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Music, Shield, CheckCircle, Info } from 'lucide-react';
import { MusicGenre, Band } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

interface CreateBandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBandCreated: (band: Band) => void;
}

export const CreateBandModal: React.FC<CreateBandModalProps> = ({
  isOpen,
  onClose,
  onBandCreated,
}) => {
  const { user, requireAuth } = useAuth();

  const [name, setName] = useState('');
  const [genre, setGenre] = useState<MusicGenre>('ROCK');
  const [foundationYear, setFoundationYear] = useState(new Date().getFullYear());
  const [bio, setBio] = useState('');
  const [members, setMembers] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      requireAuth(() => {}, 'Cadastre-se primeiro para criar e gerenciar sua banda no PalcoLivre.');
      return;
    }

    try {
      setIsLoading(true);

      const created = await ApiService.createBand({
        name,
        genre,
        foundationYear: Number(foundationYear),
        bio,
        members,
        contactPhone,
        contactEmail,
        profileImageUrl: profileImageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        bannerImageUrl: bannerImageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
      });

      setIsLoading(false);
      onBandCreated(created);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Falha ao cadastrar a banda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#1A1C23] border border-[#272A36] rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#272A36] bg-[#0F1014]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC] font-display">
                Cadastrar Perfil de Banda
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Leve o som da sua banda para o palco digital do PalcoLivre
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-full hover:bg-[#272A36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Nome e Gênero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Nome da Banda *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Os Canalhas do Rock"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Estilo Musical Principal *
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
              Biografia / História da Banda *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Conte a trajetória, propostas e estilo da sua banda..."
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
              placeholder="Ex: João (Voz e Guitarra), Maria (Baixo), Pedro (Bateria)"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
            />
          </div>

          {/* Contatos com Criptografia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1 flex items-center gap-1">
                <span>Telefone de Contato</span>
                <span title="Protegido por criptografia simétrica AES-256">
                  <Shield className="w-3 h-3 text-[#FF5500]" />
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="+55 11 99999-9999"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                E-mail para Shows / Contato *
              </label>
              <input
                type="email"
                required
                placeholder="contato@minhabanda.com.br"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
              />
            </div>
          </div>

          {/* URLs de Mídia (Integrado com Cloudflare R2) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B5CF6]">
              <UploadCloud className="w-4 h-4" />
              <span>Armazenamento de Imagens (Cloudflare R2)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Foto de Perfil (Avatar / Logo)
                </label>
                <input
                  type="url"
                  placeholder="https://... (URL pública R2)"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3 py-2 rounded-lg border border-[#272A36] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Banner de Capa (Show / Palco)
                </label>
                <input
                  type="url"
                  placeholder="https://... (URL pública R2)"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3 py-2 rounded-lg border border-[#272A36] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#272A36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold shadow-glow-orange transition-all disabled:opacity-50"
            >
              {isLoading ? 'Publicando...' : 'Publicar Perfil da Banda'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
