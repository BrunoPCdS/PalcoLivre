import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PersistentPlayer } from './components/layout/PersistentPlayer';
import { HeroSection } from './components/home/HeroSection';
import { FeaturedSection } from './components/home/FeaturedSection';
import { RecentReleases } from './components/home/RecentReleases';
import { GenreExplore } from './components/home/GenreExplore';
import { BandProfileView } from './components/band/BandProfileView';
import { BandManagementView } from './components/band/BandManagementView';
import { UserProfileView } from './components/user/UserProfileView';
import { CreateBandModal } from './components/band/CreateBandModal';
import { AuthModal } from './components/auth/AuthModal';
import { INITIAL_BANDS } from './data/mockData';
import { Band } from './types';
import { ApiService } from './services/api';

function MainApp() {
  const { user, isBand } = useAuth();
  const [bands, setBands] = useState<Band[]>(INITIAL_BANDS);
  const [currentView, setCurrentView] = useState<'home' | 'featured' | 'explore' | 'band-profile' | 'user-profile' | 'band-dashboard'>('home');
  const [selectedBandSlug, setSelectedBandSlug] = useState<string | null>(null);
  const [isCreateBandModalOpen, setIsCreateBandModalOpen] = useState(false);

  useEffect(() => {
    // Tenta carregar dados atualizados da API Neon/Express
    ApiService.getRecent()
      .then((res) => {
        if (res.recentBands && res.recentBands.length > 0) {
          setBands(res.recentBands);
        }
      })
      .catch(() => {
        // Fallback já garantido em mockData
      });
  }, []);

  const handleSelectBand = async (slug: string) => {
    try {
      const fullBand = await ApiService.getBandBySlug(slug);
      setBands((prev) => {
        const exists = prev.some((band) => band.slug === slug);
        return exists
          ? prev.map((band) => (band.slug === slug ? fullBand : band))
          : [fullBand, ...prev];
      });
    } catch (error) {
      console.warn('Erro ao carregar perfil completo da banda:', error);
    }

    setSelectedBandSlug(slug);
    setCurrentView('band-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBandCreated = (newBand: Band) => {
    setBands((prev) => [newBand, ...prev]);
    setSelectedBandSlug(newBand.slug);
    setCurrentView('band-profile');
  };

  const handleBandUpdated = (updatedBand: Band) => {
    setBands((prev) =>
      prev.map((b) => (b.id === updatedBand.id ? { ...b, ...updatedBand } : b))
    );
  };

  // Encontra a banda selecionada para exibição ou painel
  const selectedBand = bands.find((b) => b.slug === selectedBandSlug) || bands[0];

  return (
    <div className="min-h-screen bg-[#0F1014] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#FF5500] selection:text-white">
      {/* Barra de Navegação Superior com Controle de Roles (USER vs BAND) */}
      <Navbar
        onNavigate={(view) => {
          if (view === 'band-profile') return;
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateBand={() => setIsCreateBandModalOpen(true)}
      />

      {/* Conteúdo Dinâmico */}
      <main className="flex-1">
        {/* Visualização de Perfil de Usuário (Favoritos e Curtidas) */}
        {currentView === 'user-profile' && (
          <UserProfileView
            onBack={() => setCurrentView('home')}
            onSelectBand={handleSelectBand}
            onExplore={() => {
              setCurrentView('home');
              setTimeout(() => {
                const el = document.getElementById('estilos');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {/* Visualização de Gestão da Banda (Apenas BAND / Dono) */}
        {currentView === 'band-dashboard' && (
          <BandManagementView
            band={selectedBand}
            onBack={() => setCurrentView('home')}
            onBandUpdated={handleBandUpdated}
            onViewPublicProfile={(slug) => handleSelectBand(slug)}
          />
        )}

        {/* Visualização do Perfil Público da Banda */}
        {currentView === 'band-profile' && selectedBand && (
          <BandProfileView
            band={selectedBand}
            onBack={() => setCurrentView('home')}
            onEditBand={(b) => {
              setSelectedBandSlug(b.slug);
              setCurrentView('band-dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Visualização da Vitrine Principal (Home / Evidência / Estilos) */}
        {currentView !== 'band-profile' &&
          currentView !== 'user-profile' &&
          currentView !== 'band-dashboard' && (
            <>
              {/* Hero Section */}
              <HeroSection
                onOpenCreateBand={() => setIsCreateBandModalOpen(true)}
                onOpenFavorites={() => {
                  setCurrentView('user-profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExplore={() => {
                  const el = document.getElementById('estilos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Em Evidência (Destaques Animados) */}
              <FeaturedSection
                bands={bands}
                onSelectBand={handleSelectBand}
                onExploreMore={() => {
                  const el = document.getElementById('estilos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Adicionadas Recentemente */}
              <RecentReleases
                bands={bands}
                onSelectBand={handleSelectBand}
              />

              {/* Explorar por Estilos */}
              <GenreExplore
                bands={bands}
                onSelectBand={handleSelectBand}
              />
            </>
          )}
      </main>

      {/* Rodapé Informativo */}
      <Footer />

      {/* Player de Áudio Persistente Fixo no Rodapé */}
      <PersistentPlayer onOpenBandProfile={handleSelectBand} />

      {/* Modais Globais */}
      <CreateBandModal
        isOpen={isCreateBandModalOpen}
        onClose={() => setIsCreateBandModalOpen(false)}
        onBandCreated={handleBandCreated}
      />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MainApp />
      </PlayerProvider>
    </AuthProvider>
  );
}
