import { useState } from "react";
import { FloatingDemoCTA } from "./FloatingDemoCTA";
import { DemoContactModal } from "./DemoContactModal";

interface DemoWrapperProps {
  children: React.ReactNode;
}

export const DemoWrapper = ({ children }: DemoWrapperProps) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <div className="accelerator-portal min-h-screen bg-background text-foreground">
      {children}
      <FloatingDemoCTA onContactClick={() => setContactModalOpen(true)} />
      <DemoContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};
