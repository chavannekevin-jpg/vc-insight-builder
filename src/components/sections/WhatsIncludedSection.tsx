import { CheckCircle2, Info, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { WHATS_INCLUDED_DATA, getTotalFeatureCount } from "@/data/whatsIncludedData";

export const WhatsIncludedSection = () => {
  const totalFeatures = getTotalFeatureCount();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-semibold text-primary">{totalFeatures} Tools & Features</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            One Analysis.{" "}
            <span 
              className="text-primary"
              style={{ 
                textShadow: '0 0 10px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.3)'
              }}
            >
              Zero Guesswork.
            </span>
          </h2>
          
          <p className="text-muted-foreground text-lg">
            Everything you need to walk into investor meetings prepared
          </p>
        </div>

        {/* Accordion container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-50" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
              <TooltipProvider delayDuration={100}>
                <Accordion type="single" collapsible defaultValue="coreAnalysis" className="divide-y divide-border/50">
                  {WHATS_INCLUDED_DATA.map((category) => (
                    <AccordionItem key={category.key} value={category.key} className="border-none">
                      <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors group">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary/50 transition-colors">
                              <span className="text-primary font-bold text-sm">{category.items.length}</span>
                            </div>
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {category.title}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {category.items.length} features
                          </span>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-6 pb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-2">
                          {category.items.map((item, i) => (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <div className="flex items-start gap-2.5 cursor-help group/item py-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground text-sm group-hover/item:text-foreground transition-colors leading-snug">
                                    {item.name}
                                  </span>
                                  <Info className="w-3 h-3 text-muted-foreground/40 group-hover/item:text-primary transition-colors flex-shrink-0 mt-1" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="max-w-[300px] text-xs bg-card/95 backdrop-blur-xl border-primary/20 shadow-lg shadow-primary/10"
                              >
                                <p>{item.tip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Hover over any feature to see exactly what you get
        </p>
      </div>
    </section>
  );
};
