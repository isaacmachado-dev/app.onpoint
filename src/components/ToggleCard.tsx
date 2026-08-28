import React from 'react';

export interface ToggleCardProps {
  /** Texto principal exibido no card */
  label: string;
  /** Descrição ou subtítulo opcional */
  description?: string;
  /** Estado atual do toggle (marcado ou não) */
  checked: boolean;
  /** Callback acionado ao alternar o estado */
  onChange: (checked: boolean) => void;
  /** Desabilita a interação */
  disabled?: boolean;
  /** Classe de cor Tailwind para o estado ativo (padrão: 'bg-emerald-500') */
  activeColorClass?: string;
  /** Classes CSS extras para o container principal */
  className?: string;
}

export const ToggleCard: React.FC<ToggleCardProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  activeColorClass = 'bg-emerald-500',
  className = '',
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleToggle}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
      className={`relative z-10 flex flex-row items-center justify-between gap-3 w-full text-left transition-all duration-200 rounded-full cursor-pointer select-none touch-manipulation focus:outline-none ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : checked
          ? 'md:scale-[1.02]'
          : ' '
      } ${className}`}
    >
      {/* Texto / Labels */}
      <div className="flex flex-col">
        <span className="font-semibold text-black text-sm sm:text-base">
          {label}
        </span>
        {description && (
          <span className="text-xs text-zinc-400 mt-0.5">
            {description}
          </span>
        )}
      </div>

      {/* Trilho do Switch */}
      <div
        className={`shrink-0 w-16 h-9 rounded-full p-1 flex items-center transition-colors duration-300 ease-in-out ${
          checked ? activeColorClass : 'bg-brand-secondary/50'
        }`}
      >
        {/* Bolinha deslizante */}
        <div
          className={`w-7 h-7 rounded-full bg-brand-main shadow-md transform transition-transform duration-300 ease-in-out ${
            checked ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
};