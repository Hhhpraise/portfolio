export default function MobileMenu() {
  return (
    <div
      className="fixed inset-0 z-99 bg-bg hidden flex-col items-center justify-center gap-8 pointer-events-none"
      id="mobile-menu"
    >
      <button
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-border rounded-[6px]"
        id="mobile-close"
        aria-label="Close menu"
      >
        <i className="fas fa-times" />
      </button>
      <a href="#live-pages" className="font-display text-2xl font-semibold text-text-muted hover:text-text transition-colors">Live Pages</a>
      <a href="#work" className="font-display text-2xl font-semibold text-text-muted hover:text-text transition-colors">Work</a>
      <a href="#publications" className="font-display text-2xl font-semibold text-text-muted hover:text-text transition-colors">Papers</a>
      <a href="#about" className="font-display text-2xl font-semibold text-text-muted hover:text-text transition-colors">About</a>
      <a href="#contact" className="font-display text-2xl font-semibold text-text-muted hover:text-text transition-colors">Contact</a>
      <a href="https://github.com/Hhhpraise" target="_blank" rel="noopener" className="font-display text-2xl font-semibold text-text-muted hover:text-text transition-colors">GitHub</a>
    </div>
  );
}
