import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  name: string;
  label: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  showHelper?: boolean;
}

export default function PasswordInput({ name, label, required = false, minLength, placeholder, showHelper = false }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className="w-full bg-skan-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-skan-500 focus:ring-1 focus:ring-skan-500 transition-all text-sm pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showHelper && (
        <p className="text-[10px] text-slate-500">Mínimo 8 caracteres con mayúscula o símbolo</p>
      )}
    </div>
  );
}
