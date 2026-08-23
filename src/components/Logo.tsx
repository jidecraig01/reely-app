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
        src="/REELY_LOGO.png"
        alt="REELY"
        width={Math.round(size * 1.7)}
        height={size}
        className="reely-logo-image object-contain"
      />
    </div>
  );
}
