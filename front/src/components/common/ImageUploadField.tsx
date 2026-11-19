import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { ApiService } from '../../services/api';

interface ImageUploadFieldProps {
  label: string;
  category: 'avatar' | 'banner' | 'gallery' | 'album-cover';
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  entityId?: string;
  aspect?: 'square' | 'video' | 'banner';
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  category,
  currentUrl,
  onUploadSuccess,
  entityId = 'media',
  aspect = 'square',
  helperText,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentUrl) {
      setPreviewUrl(currentUrl);
    }
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    // Preview imediato local antes do upload
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(true);

    try {
      // Upload direto para o Cloudflare R2
      const result = await ApiService.uploadFileToR2(file, category, entityId);
      setPreviewUrl(result.publicUrl);
      setUploadSuccess(true);
      onUploadSuccess(result.publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Falha ao enviar imagem para o Cloudflare R2.');
    } finally {
      setIsUploading(false);
    }
  };

  const getAspectClass = () => {
    switch (aspect) {
      case 'banner':
        return 'h-32 w-full';
      case 'video':
        return 'aspect-video w-full';
      case 'square':
      default:
        return 'w-24 h-24 rounded-2xl';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#F8FAFC]">
          {label}
        </label>
        {uploadSuccess && (
          <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> R2 Conectado
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Caixa de Preview da Imagem */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative ${getAspectClass()} rounded-xl border border-dashed border-[#272A36] bg-[#0F1014] hover:border-[#FF5500] cursor-pointer overflow-hidden flex items-center justify-center transition-all group flex-shrink-0`}
          title="Clique para selecionar ou trocar imagem"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-[#94A3B8] group-hover:text-[#FF5500] transition-colors">
              <ImageIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] text-center">Sem foto</span>
            </div>
          )}

          {/* Overlay durante upload */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 z-10">
              <Loader2 className="w-5 h-5 text-[#FF5500] animate-spin" />
              <span className="text-[9px] text-[#F8FAFC] font-semibold">Enviando R2...</span>
            </div>
          )}

          {/* Hover overlay quando já tem imagem */}
          {!isUploading && previewUrl && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Controles e Botão */}
        <div className="flex-1 space-y-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#272A36] hover:bg-[#343847] text-[#F8FAFC] text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>{previewUrl ? 'Alterar Imagem' : 'Enviar Arquivo (R2)'}</span>
          </button>

          {helperText && (
            <p className="text-[10px] text-[#94A3B8] leading-tight">
              {helperText}
            </p>
          )}

          {uploadError && (
            <p className="text-[10px] text-red-400 font-medium">
              {uploadError}
            </p>
          )}

          {previewUrl && (
            <p className="text-[9px] text-[#94A3B8] truncate max-w-xs font-mono" title={previewUrl}>
              {previewUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
