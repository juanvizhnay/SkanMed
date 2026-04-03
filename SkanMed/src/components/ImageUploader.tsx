import { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function ImageUploader({
  onImageUploaded,
  currentImageUrl = '',
  label = 'Imagen de la Operación'
}: ImageUploaderProps) {
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

    const maxSizeMB = 3; // Más estricto para forzar optimización
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen no debe superar ${maxSizeMB}MB. Por favor, optimiza la imagen antes de subir (usa TinyPNG, Squoosh, etc.)`);
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
      onImageUploaded(data.url);
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
    onImageUploaded('');
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
        {label}
      </label>

      {/* Preview de la imagen */}
      {preview && (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-white/10"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleClickUpload}
              disabled={uploading}
              className="px-4 py-2 bg-skan-500 hover:bg-skan-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={uploading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Zona de subida */}
      {!preview && (
        <div
          onClick={handleClickUpload}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all hover:border-skan-500 hover:bg-white/[0.02]
            ${uploading ? 'border-skan-500 bg-white/[0.02]' : 'border-white/10'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <div className="w-12 h-12 rounded-full border-4 border-skan-500 border-t-transparent animate-spin"></div>
                <p className="text-sm text-skan-400 font-medium">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">
                    Haz clic para subir una imagen
                  </p>
                  <p className="text-xs text-slate-500">
                    JPG, PNG, WebP o AVIF (máx. 3MB)
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    💡 Optimiza tus imágenes con TinyPNG o Squoosh
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
          <span>Imagen subida exitosamente</span>
        </div>
      )}

      {/* Campo hidden para el formulario */}
      <input type="hidden" name="image_url" value={imageUrl} />
    </div>
  );
}
