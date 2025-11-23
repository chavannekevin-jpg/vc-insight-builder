import { Button } from "../ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();
  
  const links = [
    { label: t('footer.about'), href: "/about" },
    { label: t('footer.faq'), href: "#" },
    { label: t('footer.terms'), href: "#" },
    { label: t('footer.privacy'), href: "#" },
    { label: t('footer.contact'), href: "#" }
  ];

  return (
    <footer className="py-12 px-4 border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {links.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => window.location.href = link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Button>
          ))}
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t('footer.built')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
