interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size, className = '', onClick }: LogoProps) {
  const heightClass = size ? '' : 'h-40 sm:h-56';
  const style = size ? { height: `${size}px` } : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="REELY home"
      className={`flex items-start pointer-events-auto ${className}`}
    >
      <img
        src="/reely-logo-watermark.webp"
        alt="REELY"
        style={style}
        className={`${heightClass} w-auto object-contain opacity-80 select-none`}
        draggable={false}
      />
    </button>
  );
}
