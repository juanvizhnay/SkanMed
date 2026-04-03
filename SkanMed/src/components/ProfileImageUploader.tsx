import { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, User } from 'lucide-react';

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
}

export default function ProfileImageUploader({
  currentImageUrl = '',
}: ProfileImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación del lado del cliente
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, WebP, AVIF)');
      return;
    }

    const maxSizeMB = 2; // Más estricto para fotos de perfil
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen no debe superar ${maxSizeMB}MB`);
      return;
    }

    setError('');
    setUploading(true);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Subir al servidor
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      setImageUrl(data.url);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
      setPreview(currentImageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        Foto de Perfil Profesional
      </label>

      <div className="flex items-start gap-6">
        {/* Preview circular */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/10"
              />
              <div
                onClick={handleClickUpload}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer"
              >
                <Upload size={24} className="text-white" />
              </div>
            </div>
          ) : (
            <div
              onClick={handleClickUpload}
              className="w-32 h-32 rounded-full bg-skan-950 border-4 border-white/10 flex items-center justify-center cursor-pointer hover:border-skan-500 transition-colors"
            >
              <User size={48} className="text-slate-600" />
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClickUpload}
              disabled={uploading}
              className="px-4 py-2 bg-skan-500/10 hover:bg-skan-500/20 text-skan-400 rounded-lg text-sm font-medium transition-colors border border-skan-500/20 disabled:opacity-50"
            >
              {uploading ? 'Subiendo...' : preview ? 'Cambiar foto' : 'Subir foto'}
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploading}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20 disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Recomendado: Foto profesional cuadrada, fondo neutro. JPG, PNG o WebP (máx. 2MB)
          </p>

          {/* Mensajes de error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mensaje de éxito */}
          {imageUrl && !error && !uploading && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs">
              <Check size={16} />
              <span>Foto de perfil actualizada</span>
            </div>
          )}
        </div>
      </div>

      {/* Campo hidden para el formulario */}
      <input type="hidden" name="profile_picture_url" value={imageUrl} />
    </div>
  );
}
