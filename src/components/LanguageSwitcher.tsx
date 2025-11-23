import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
      className="font-semibold uppercase tracking-wider"
    >
      {language === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
    </Button>
  );
};
