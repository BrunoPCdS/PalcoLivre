import React from 'react';
import { Disc, Radio, ShieldCheck, Heart } from 'lucide-react';
import logoImg from '../../img/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F1014] border-t border-[#272A36] pt-12 pb-32 text-[#94A3B8] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="PalcoLivre" className="h-9 w-auto" />
              <span className="text-base font-extrabold text-[#F8FAFC] font-display">
                PALCO<span className="text-[#FF5500]">LIVRE</span>
              </span>
            </div>
            <p className="leading-relaxed">
              A plataforma definitiva para divulgação de bandas independentes, álbuns autorais e conexão direta entre artistas e fãs.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#8B5CF6]">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Transmissão de alta fidelidade via Cloudflare R2</span>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-[#F8FAFC] font-bold uppercase tracking-wider mb-3 text-xs">Navegação</h4>
            <ul className="space-y-2">
              <li><a href="#destaques" className="hover:text-[#FF5500] transition-colors">Em Evidência</a></li>
              <li><a href="#recentes" className="hover:text-[#FF5500] transition-colors">Lançamentos Recentes</a></li>
              <li><a href="#estilos" className="hover:text-[#FF5500] transition-colors">Explorar por Gênero</a></li>
              <li><a href="#cadastro" className="hover:text-[#FF5500] transition-colors">Cadastrar Banda</a></li>
            </ul>
          </div>

          {/* Tecnologias & Infraestrutura */}
          <div>
            <h4 className="text-[#F8FAFC] font-bold uppercase tracking-wider mb-3 text-xs">Infraestrutura</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-[#F8FAFC]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>PostgreSQL Neon Serverless</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#F8FAFC]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Cloudflare R2 Object Storage</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#F8FAFC]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Mailtrap E-mails Transacionais</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#F8FAFC]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Prisma ORM & Zod Validation</span>
              </li>
            </ul>
          </div>

          {/* Manifesto */}
          <div>
            <h4 className="text-[#F8FAFC] font-bold uppercase tracking-wider mb-3 text-xs">O Palco é Seu</h4>
            <p className="leading-relaxed mb-3">
              Sem paywalls predatórios. Sem algoritmos que privilegiam apenas quem paga anúncio. Música autêntica ao alcance de todos.
            </p>
            <span className="inline-block bg-[#1A1C23] border border-[#272A36] px-3 py-1 rounded text-[11px] text-[#FF5500] font-semibold">
              Limite justo: 10 faixas por álbum
            </span>
          </div>
        </div>

        <div className="border-t border-[#272A36] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>&copy; {new Date().getFullYear()} PalcoLivre. Todos os direitos reservados à arte independente.</p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-[#FF5500] fill-[#FF5500]" /> para o cenário musical autoral.
          </p>
        </div>
      </div>
    </footer>
  );
};
