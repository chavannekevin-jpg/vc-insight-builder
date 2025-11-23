import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'nav.product': 'Product',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.login': 'Login',
    
    // Hero Section
    'hero.badge': 'Built by VCs',
    'hero.title.1': 'Stop Getting',
    'hero.title.2': 'Ghosted',
    'hero.title.3': 'by VCs',
    'hero.subtitle': "We're active early-stage investors who know exactly what VCs look for—because nobody will tell you that your baby is ugly. Get the unfiltered truth about your startup before investors do.",
    'hero.punchline': 'Because nobody will tell you that your baby is ugly.',
    'hero.cta': 'Build My Memo',
    'hero.discount': '50% OFF for early sign-ups',
    
    // Footer
    'footer.about': 'About',
    'footer.faq': 'FAQ',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.contact': 'Contact',
    'footer.built': 'Built by Active Early-Stage VCs',
    'footer.copyright': '© 2025 UglyBaby • Active Venture Capital Investors • Pre-Seed to Series A Specialists',
  },
  fr: {
    // Header
    'nav.product': 'Produit',
    'nav.pricing': 'Tarifs',
    'nav.about': 'À Propos',
    'nav.login': 'Connexion',
    
    // Hero Section
    'hero.badge': 'Créé par des VCs',
    'hero.title.1': 'Arrêtez de Vous Faire',
    'hero.title.2': 'Ghoster',
    'hero.title.3': 'par les VCs',
    'hero.subtitle': "Nous sommes des investisseurs actifs en phase d'amorçage qui savent exactement ce que les VCs recherchent—parce que personne ne vous dira que votre bébé est moche. Obtenez la vérité sans filtre sur votre startup avant les investisseurs.",
    'hero.punchline': 'Parce que personne ne vous dira que votre bébé est moche.',
    'hero.cta': 'Créer Mon Mémo',
    'hero.discount': '50% DE RÉDUCTION pour les inscriptions anticipées',
    
    // Footer
    'footer.about': 'À Propos',
    'footer.faq': 'FAQ',
    'footer.terms': 'Conditions',
    'footer.privacy': 'Confidentialité',
    'footer.contact': 'Contact',
    'footer.built': 'Créé par des VCs Actifs en Phase Précoce',
    'footer.copyright': '© 2025 UglyBaby • Investisseurs en Capital-Risque Actifs • Spécialistes Pre-Seed à Série A',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
