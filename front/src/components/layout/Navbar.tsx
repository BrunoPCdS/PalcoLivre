import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, PlusCircle, LogIn, LogOut, User, Music2 } from 'lucide-react';
import logoImg from '../../img/logo.png';

interface NavbarProps {
  onNavigate: (view: 'home' | 'featured' | 'explore' | 'band-profile' | 'create-band', param?: string) => void;
  onOpenCreateBand: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenCreateBand }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1A1C23]/90 backdrop-blur-md border-b border-[#272A36]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Slogan */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group transition-transform duration-200 hover:scale-[1.02]"
        >
          <img 
            src={logoImg} 
            alt="PalcoLivre Logo" 
            className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]" 
          />
          <div className="hidden sm:block">
            <span className="text-xl font-extrabold tracking-tight text-[#F8FAFC] font-display flex items-center gap-1.5">
              PALCO<span className="text-[#FF5500]">LIVRE</span>
            </span>
            <span className="block text-[11px] font-semibold text-[#8B5CF6] tracking-wider uppercase">
              A voz da música independente
            </span>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#94A3B8]">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#F8FAFC] transition-colors"
          >
            Início
          </button>
          <button
            onClick={() => onNavigate('featured')}
            className="hover:text-[#FF5500] transition-colors flex items-center gap-1"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF5500] animate-ping" />
            Em Evidência
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className="hover:text-[#8B5CF6] transition-colors"
          >
            Explorar Estilos
          </button>
        </nav>

        {/* Busca rápida e Ações de Auth */}
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar bandas, estilos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F1014] text-xs text-[#F8FAFC] placeholder-[#94A3B8] pl-9 pr-3 py-2 rounded-full border border-[#272A36] focus:outline-none focus:border-[#FF5500] transition-all"
            />
          </div>

          {/* CTA Cadastrar Banda */}
          <button
            onClick={onOpenCreateBand}
            className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-glow-orange hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Cadastrar Banda</span>
          </button>

          {/* Usuário / Login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#0F1014] px-3 py-1.5 rounded-full border border-[#272A36]">
                <div className="w-7 h-7 rounded-full bg-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-[#F8FAFC] max-w-[100px] truncate hidden sm:inline">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sair"
                className="p-2 text-[#94A3B8] hover:text-red-400 hover:bg-[#0F1014] rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#F8FAFC] hover:text-[#8B5CF6] bg-[#0F1014] hover:bg-[#272A36] px-3.5 py-2 rounded-full border border-[#272A36] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
