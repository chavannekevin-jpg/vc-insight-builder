import { cn } from "@/lib/utils";

interface WorkshopLayoutProps {
  children: React.ReactNode;
}

export function WorkshopLayout({ children }: WorkshopLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] relative">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Workshop</h1>
          <p className="text-muted-foreground mt-1">
            Build your investment mini-memorandum step by step
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
