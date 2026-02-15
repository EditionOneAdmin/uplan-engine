import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm text-slate-text/40">Vom Flürstück zur Genehmigungsreife.</span>
        </div>

        <nav className="flex gap-6 text-sm text-slate-text/50">
          <a href="#pipeline" className="hover:text-primary transition-colors">Produkt</a>
          <a href="#kontakt" className="hover:text-primary transition-colors">Kontakt</a>
          <a href="#" className="hover:text-primary transition-colors">Impressum</a>
          <a href="#" className="hover:text-primary transition-colors">Datenschutz</a>
        </nav>

        <p className="text-xs text-slate-text/30">© 2026 U-Plan Engine</p>
      </div>
    </footer>
  );
}
