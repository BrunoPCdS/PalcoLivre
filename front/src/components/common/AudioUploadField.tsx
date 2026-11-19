import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Music, Loader2, Play, Pause, FileAudio } from 'lucide-react';
import { ApiService } from '../../services/api';

interface AudioUploadFieldProps {
  onAudioUploaded: (data: { audioUrl: string; r2Key: string; duration: number; fileName: string }) => void;
  albumId?: string;
}

export const AudioUploadField: React.FC<AudioUploadFieldProps> = ({
  onAudioUploaded,
  albumId = 'album-temp',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo MP3/Áudio
    if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
      setErrorMsg('Formato inválido. Por favor, selecione um arquivo de áudio MP3 válido (.mp3).');
      return;
    }

    // Limite de 50MB
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('Arquivo muito grande. O limite máximo para faixas é de 50MB.');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setUploadProgress(false);
    setIsUploading(true);

    // Mede a duração exata do arquivo de áudio no navegador
    const localAudioUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(localAudioUrl);

    tempAudio.onloadedmetadata = async () => {
      const durationSeconds = Math.round(tempAudio.duration) || 180;
      setAudioDuration(durationSeconds);

      try {
        // Envia para o bucket Cloudflare R2
        const result = await ApiService.uploadFileToR2(file, 'track-audio', albumId);
        setUploadedUrl(result.publicUrl);
        setUploadProgress(true);

        onAudioUploaded({
          audioUrl: result.publicUrl,
          r2Key: result.fileKey,
          duration: durationSeconds,
          fileName: file.name.replace(/\.[^/.]+$/, ''), // Nome limpo sem .mp3
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao enviar áudio MP3 para o Cloudflare R2.');
      } finally {
        setIsUploading(false);
      }
    };

    tempAudio.onerror = async () => {
      // Fallback de duração caso o navegador demore a decodificar os metadados
      const defaultDuration = 180;
      setAudioDuration(defaultDuration);

      try {
        const result = await ApiService.uploadFileToR2(file, 'track-audio', albumId);
        setUploadedUrl(result.publicUrl);
        setUploadProgress(true);

        onAudioUploaded({
          audioUrl: result.publicUrl,
          r2Key: result.fileKey,
          duration: defaultDuration,
          fileName: file.name.replace(/\.[^/.]+$/, ''),
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao enviar áudio MP3 para o Cloudflare R2.');
      } finally {
        setIsUploading(false);
      }
    };
  };

  const togglePreview = () => {
    if (!uploadedUrl) return;

    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(uploadedUrl);
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="bg-[#0F1014] p-3 rounded-xl border border-[#272A36] space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg, .mp3"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
          <FileAudio className="w-4 h-4 text-[#FF5500]" />
          <span>Arquivo de Áudio (.mp3)</span>
        </span>

        {uploadProgress && (
          <span className="flex items-center gap-1 text-[10px] text-green-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> MP3 Salvo no R2
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#272A36] hover:bg-[#343847] text-[#F8FAFC] text-xs font-bold transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#FF5500] animate-spin" />
              <span>Enviando para o R2...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>{selectedFile ? 'Substituir MP3' : 'Selecionar Arquivo MP3'}</span>
            </>
          )}
        </button>

        {selectedFile && (
          <div className="flex-1 min-w-0 flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="font-semibold text-[#F8FAFC] block truncate">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                {audioDuration > 0 && ` • Duração: ${formatDuration(audioDuration)}`}
              </span>
            </div>

            {uploadedUrl && (
              <button
                type="button"
                onClick={togglePreview}
                className="p-1.5 rounded-full bg-[#1A1C23] text-[#FF5500] hover:scale-110 transition-transform border border-[#272A36]"
                title={isPlayingPreview ? 'Pausar prévia' : 'Ouvir prévia'}
              >
                {isPlayingPreview ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-[10px] text-red-400 font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
