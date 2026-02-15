export default function OwlLogo({ size = 34, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <rect width="40" height="40" rx="10" fill="url(#owlGradient)" />

      {/* Owl body */}
      <ellipse cx="20" cy="24" rx="10" ry="11" fill="white" fillOpacity="0.2" />

      {/* Left eye */}
      <circle cx="15" cy="18" r="5" fill="white" fillOpacity="0.95" />
      <circle cx="15.5" cy="17.5" r="2.5" fill="#1E1B4B" />
      <circle cx="16.5" cy="16.5" r="0.8" fill="white" />

      {/* Right eye */}
      <circle cx="25" cy="18" r="5" fill="white" fillOpacity="0.95" />
      <circle cx="25.5" cy="17.5" r="2.5" fill="#1E1B4B" />
      <circle cx="26.5" cy="16.5" r="0.8" fill="white" />

      {/* Beak */}
      <path d="M18 22 L20 25 L22 22" fill="#F59E0B" stroke="#F59E0B" strokeWidth="0.5" strokeLinejoin="round" />

      {/* Ear tufts */}
      <path d="M10 13 L13 8 L14 14" fill="white" fillOpacity="0.3" />
      <path d="M30 13 L27 8 L26 14" fill="white" fillOpacity="0.3" />

      {/* Graduation cap */}
      <path d="M8 11 L20 6 L32 11 L20 16 Z" fill="white" fillOpacity="0.9" />
      <line x1="28" y1="11" x2="28" y2="17" stroke="white" strokeOpacity="0.9" strokeWidth="1" />
      <circle cx="28" cy="17.5" r="1" fill="#F59E0B" />

      <defs>
        <linearGradient id="owlGradient" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
