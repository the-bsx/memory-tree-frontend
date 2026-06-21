export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-parchment-light">
      {/* Left panel — brand identity, hidden on small screens */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-bark overflow-hidden flex-col justify-between p-12">
        {/* Organic texture: layered radial rings, like tree growth */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none">
            <circle cx="80" cy="700" r="60" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="80" cy="700" r="110" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="80" cy="700" r="170" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="80" cy="700" r="240" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="80" cy="700" r="320" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-clay-light">
              <path
                d="M12 2C12 2 7 6 7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11C17 6 12 2 12 2Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
              />
              <path d="M12 17V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 20H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-serif text-xl text-parchment-light tracking-wide">MemoryTree</span>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="font-serif text-3xl text-parchment-light leading-snug italic">
            "Every life is a story worth keeping."
          </p>
          <p className="mt-4 text-parchment/70 text-sm leading-relaxed">
            Organize the chapters, moments, and memories that made you who you are —
            all in one rooted place.
          </p>
        </div>

        <div className="relative z-10 text-parchment/40 text-xs">
          © {new Date().getFullYear()} MemoryTree
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          {/* Mobile-only brand mark */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-bark">
              <path
                d="M12 2C12 2 7 6 7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11C17 6 12 2 12 2Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
              />
              <path d="M12 17V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 20H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-serif text-lg text-bark tracking-wide">MemoryTree</span>
          </div>

          <h1 className="font-serif text-3xl text-ink mb-2">{title}</h1>
          {subtitle && <p className="text-mist-light text-sm mb-8 text-bark-light/70">{subtitle}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}
