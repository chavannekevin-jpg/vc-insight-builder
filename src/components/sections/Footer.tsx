import { Win98StartButton } from "../Win98StartButton";

export const Footer = () => {
  const links = [
    { label: "About", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "#" }
  ];

  return (
    <footer className="py-8 px-4 bg-win98-taskbar border-t-2 border-win98-light">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {links.map((link, index) => (
            <Win98StartButton
              key={index}
              onClick={() => window.location.href = link.href}
              className="text-xs"
            >
              {link.label}
            </Win98StartButton>
          ))}
        </div>
        
        <div className="text-center win98-inset p-2 bg-background inline-block mx-auto block">
          <p className="font-sans text-xs">
            © 2025 VC Memorandum Generator • Built with 10+ years of venture capital experience
          </p>
        </div>
      </div>
    </footer>
  );
};
