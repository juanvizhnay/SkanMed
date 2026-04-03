import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "Copiar URL" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Copy failed silently
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <Check size={12} className="text-green-400" /> Copiado
        </>
      ) : (
        <>
          <Copy size={12} /> {label}
        </>
      )}
    </button>
  );
}
