interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size = 40, className = '', onClick }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`} onClick={onClick}>
      <img
        src="/magnific_isolated-logo-featuring-t_iGYrE7N3uK.png"
        alt="REELY"
        width={Math.round(size * 1.5)}
        height={size}
        className="reely-logo-image object-contain w-auto max-w-none h-20 sm:h-24 drop-shadow-[0_0_18px_rgba(255,138,61,0.7)]"
      />
    </div>
  );
}
