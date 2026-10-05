export default function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        width="42"
        height="42"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <defs>
          <linearGradient id="forge-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="forge-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        <polygon points="40,5 70,20 40,35 10,20" fill="url(#forge-grad-1)" />
        <polygon points="10,20 40,35 40,70 10,55" fill="url(#forge-grad-2)" opacity="0.8" />
        <polygon points="40,35 70,20 70,55 40,70" fill="#1e3a8a" opacity="0.9" />

        <path
          d="M 28,42 L 38,48 L 28,54"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="42"
          y1="54"
          x2="50"
          y2="54"
          stroke="#60a5fa"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex flex-col">
        <span className="font-extrabold text-xl tracking-tight text-white leading-none">
          DEV<span className="text-blue-400">FORGE</span>
        </span>
        <span className="text-[9px] font-bold tracking-[0.25em] text-slate-400 mt-1">
          SOFTWARE STUDIO
        </span>
      </div>
    </div>
  );
}