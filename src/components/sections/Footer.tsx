export const Footer = () => {
  const links = [
    { label: "About", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "#" }
  ];

  return (
    <footer className="py-8 px-4 border-t-4 border-foreground bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="font-retro text-xl hover:text-primary transition-colors win98-border px-4 py-1 bg-background hover:bg-background/80"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="text-center win98-border-inset bg-input p-4 inline-block mx-auto block">
          <p className="font-retro text-lg">
            © 2025 VC Memorandum Generator. Built with 10+ years of venture capital experience.
          </p>
        </div>
      </div>
    </footer>
  );
};
