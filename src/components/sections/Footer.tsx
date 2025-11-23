export const Footer = () => {
  const links = [
    { label: "About", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "#" }
  ];

  return (
    <footer className="py-12 px-4 border-t border-border bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="font-sans text-sm font-medium hover:text-primary transition-colors px-4 py-2 rounded hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="text-center">
          <p className="font-sans text-sm text-muted-foreground">
            © 2025 VC Memorandum Generator. Built with 10+ years of venture capital experience.
          </p>
        </div>
      </div>
    </footer>
  );
};
