export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-text-faint md:flex-row">
        <p>© {new Date().getFullYear()} Finance AI. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-text-dim">
            Privacidade
          </a>
          <a href="#" className="hover:text-text-dim">
            Termos
          </a>
        </div>
      </div>
    </footer>
  );
}
