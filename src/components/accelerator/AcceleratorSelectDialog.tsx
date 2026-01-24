import { motion } from "framer-motion";
import { Building2, ArrowRight, Users, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
}

interface AcceleratorSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accelerators: Accelerator[];
  onSelect: (accelerator: Accelerator) => void;
  isLoading?: boolean;
}

export function AcceleratorSelectDialog({
  open,
  onOpenChange,
  accelerators,
  onSelect,
  isLoading = false,
}: AcceleratorSelectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Select Your Ecosystem
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You have access to multiple accelerator ecosystems. Choose which one to enter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto py-2">
          {accelerators.map((acc, index) => (
            <motion.button
              key={acc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(acc)}
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-background hover:bg-muted/50 border border-border/50 hover:border-primary/30 transition-all group text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                {/* Logo/Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors overflow-hidden">
                  {acc.logo_url ? (
                    <img
                      src={acc.logo_url}
                      alt={acc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-primary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {acc.name}
                    </h3>
                    {!acc.onboarding_completed && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning rounded-full shrink-0">
                        Setup pending
                      </span>
                    )}
                  </div>
                  {acc.description ? (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {acc.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      /{acc.slug}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground">
            Want to create another ecosystem?{" "}
            <a href="/accelerator/signup" className="text-primary hover:underline">
              Start here
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
