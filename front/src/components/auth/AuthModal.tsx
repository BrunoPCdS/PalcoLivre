import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogIn, UserPlus, Music, Headphones } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../img/logo.png';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authPromptReason,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'LISTENER' | 'BAND_MANAGER'>('LISTENER');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincroniza o modo caso venha alterado do contexto
  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Falha na autenticação. Verifique suas informações.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-[#1A1C23] border border-[#272A36] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        {/* Fechar Modal */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-full hover:bg-[#272A36] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Headline */}
        <div className="text-center mb-6">
          <img src={logoImg} alt="PalcoLivre" className="h-12 w-auto mx-auto mb-2" />
          <h3 className="text-xl font-extrabold text-[#F8FAFC] font-display">
            PALCO<span className="text-[#FF5500]">LIVRE</span>
          </h3>
          <p className="text-xs text-[#8B5CF6] font-semibold mt-0.5">
            A voz da música independente
          </p>

          {/* Chamada de Regra de Engajamento */}
          {authPromptReason && (
            <div className="mt-4 p-3 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-xl text-xs text-[#F8FAFC] flex items-center gap-2 text-left">
              <Sparkles className="w-4 h-4 text-[#FF5500] flex-shrink-0" />
              <span>{authPromptReason}</span>
            </div>
          )}
        </div>

        {/* Alternância de Abas: Entrar vs Cadastrar */}
        <div className="flex bg-[#0F1014] p-1 rounded-xl mb-6 border border-[#272A36]">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-[#1A1C23] text-[#F8FAFC] shadow'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-[#1A1C23] text-[#FF5500] shadow'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Seu Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#272A36] focus:border-[#FF5500] focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">
                Tipo de Perfil
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('LISTENER')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    role === 'LISTENER'
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white'
                      : 'border-[#272A36] bg-[#0F1014] text-[#94A3B8]'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-[#8B5CF6]" />
                  <div>
                    <span className="block text-xs font-bold">Ouvinte</span>
                    <span className="text-[10px] text-[#94A3B8]">Descobrir sons</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('BAND_MANAGER')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    role === 'BAND_MANAGER'
                      ? 'border-[#FF5500] bg-[#FF5500]/10 text-white'
                      : 'border-[#272A36] bg-[#0F1014] text-[#94A3B8]'
                  }`}
                >
                  <Music className="w-4 h-4 text-[#FF5500]" />
                  <div>
                    <span className="block text-xs font-bold">Banda / Artista</span>
                    <span className="text-[10px] text-[#94A3B8]">Publicar álbuns</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold transition-all shadow-glow-orange hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
          >
            {isLoading
              ? 'Conectando ao Palco...'
              : mode === 'login'
              ? 'Entrar no PalcoLivre'
              : 'Criar Minha Conta Grátis'}
          </button>
        </form>

        <p className="text-[11px] text-center text-[#94A3B8] mt-6">
          Ao continuar, você apoia diretamente a produção artística nacional e independente.
        </p>
      </motion.div>
    </div>
  );
};
