import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PersistentPlayer } from './components/layout/PersistentPlayer';
import { HeroSection } from './components/home/HeroSection';
import { FeaturedSection } from './components/home/FeaturedSection';
import { RecentReleases } from './components/home/RecentReleases';
import { GenreExplore } from './components/home/GenreExplore';
import { BandProfileView } from './components/band/BandProfileView';
import { CreateBandModal } from './components/band/CreateBandModal';
import { AuthModal } from './components/auth/AuthModal';
import { INITIAL_BANDS } from './data/mockData';
import { Band } from './types';
import { ApiService } from './services/api';

function MainApp() {
  const [bands, setBands] = useState<Band[]>(INITIAL_BANDS);
  const [currentView, setCurrentView] = useState<'home' | 'featured' | 'explore' | 'band-profile'>('home');
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

  const handleSelectBand = (slug: string) => {
    setSelectedBandSlug(slug);
    setCurrentView('band-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBandCreated = (newBand: Band) => {
    setBands((prev) => [newBand, ...prev]);
    setSelectedBandSlug(newBand.slug);
    setCurrentView('band-profile');
  };

  const selectedBand = bands.find((b) => b.slug === selectedBandSlug) || bands[0];

  return (
    <div className="min-h-screen bg-[#0F1014] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#FF5500] selection:text-white">
      {/* Barra de Navegação Superior */}
      <Navbar
        onNavigate={(view) => {
          if (view === 'band-profile') return;
          setCurrentView(view as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateBand={() => setIsCreateBandModalOpen(true)}
      />

      {/* Conteúdo Dinâmico */}
      <main className="flex-1">
        {currentView === 'band-profile' && selectedBand ? (
          <BandProfileView
            band={selectedBand}
            onBack={() => setCurrentView('home')}
          />
        ) : (
          <>
            {/* Hero Section */}
            <HeroSection
              onOpenCreateBand={() => setIsCreateBandModalOpen(true)}
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
