import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Compass, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeroSectionProps {
  onOpenCreateBand: () => void;
  onExplore: () => void;
  onOpenFavorites?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCreateBand,
  onExplore,
  onOpenFavorites,
}) => {
  const { isAuthenticated, isBand, openAuthModal } = useAuth();

  const handleBandCta = () => {
    if (!isAuthenticated) {
      openAuthModal('register', 'Crie sua Conta de Banda (BAND) para cadastrar e gerenciar perfis no PalcoLivre!');
    } else if (isBand) {
      onOpenCreateBand();
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-[#272A36]">
      {/* Background Stage Lighting Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#FF5500]/15 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 -right-20 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge Chamada */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1C23] border border-[#FF5500]/40 text-[#FF5500] text-xs font-bold tracking-wide uppercase shadow-glow-orange mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>A voz da música autoral e independente</span>
        </motion.div>

        {/* Título Principal */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#F8FAFC] tracking-tight font-display max-w-4xl mx-auto leading-tight"
        >
          Dê palco ao som que não cabe nos{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#FF8844] to-[#8B5CF6]">
            algoritmos tradicionais.
          </span>
        </motion.h1>

        {/* Subtítulo / Proposta de Valor */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed"
        >
          O <strong>PalcoLivre</strong> conecta bandas autorais, produtores e amantes de música boa.
          Publique seus álbuns com streaming de alta definição, receba apoio direto do público e encontre a trilha sonora da sua próxima obsessão.
        </motion.p>

        {/* CTAs Principais com Controle de Acesso e Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* 
            Usuário comum (USER): Não deve ver o botão de Cadastrar Banda em nenhuma parte.
            Conta de Banda (BAND) ou Visitante: Pode visualizar.
          */}
          {(!isAuthenticated || isBand) && (
            <button
              onClick={handleBandCta}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-glow-orange hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Flame className="w-4 h-4 fill-white group-hover:animate-bounce" />
              <span>Cadastrar Minha Banda</span>
            </button>
          )}

          {/* Se for usuário comum (USER) logado, exibe botão para seus favoritos */}
          {isAuthenticated && !isBand && onOpenFavorites && (
            <button
              onClick={onOpenFavorites}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-glow-purple hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Ver Minhas Músicas e Bandas Favoritas</span>
            </button>
          )}

          <button
            onClick={onExplore}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1A1C23] hover:bg-[#272A36] text-[#F8FAFC] hover:text-[#8B5CF6] border border-[#272A36] hover:border-[#8B5CF6] font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#8B5CF6]" />
            <span>Explorar Sons da Cena</span>
          </button>
        </motion.div>

        {/* Métricas de Comunidade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-[#272A36]/60 text-center"
        >
          <div className="p-3">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
              +1.400
            </span>
            <span className="text-xs text-[#94A3B8]">Bandas Cadastradas</span>
          </div>

          <div className="p-3">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#FF5500] font-display">
              100%
            </span>
            <span className="text-xs text-[#94A3B8]">Independente & Livre</span>
          </div>

          <div className="p-3">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#8B5CF6] font-display">
              Cloudflare R2
            </span>
            <span className="text-xs text-[#94A3B8]">Streaming Sem Perdas</span>
          </div>

          <div className="p-3">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
              Zero
            </span>
            <span className="text-xs text-[#94A3B8]">Algoritmos Restritivos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
