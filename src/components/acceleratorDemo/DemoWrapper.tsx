import { useState } from "react";
import { FloatingDemoCTA } from "./FloatingDemoCTA";
import { DemoContactModal } from "./DemoContactModal";

interface DemoWrapperProps {
  children: React.ReactNode;
}

export const DemoWrapper = ({ children }: DemoWrapperProps) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <>
      {children}
      <FloatingDemoCTA onContactClick={() => setContactModalOpen(true)} />
      <DemoContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </>
  );
};
