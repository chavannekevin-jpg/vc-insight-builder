import { DemoLayout } from "@/components/demo/DemoLayout";
import { DemoToolWrapper } from "@/components/demo/DemoToolWrapper";
import ValuationCalculator from "@/pages/ValuationCalculator";

export default function DemoValuationCalculator() {
  return (
    <DemoLayout currentPage="dashboard">
      <DemoToolWrapper
        toolName="Valuation Calculator"
        toolDescription="Create an account to calculate your startup's valuation using multiple methodologies."
      >
        <ValuationCalculator />
      </DemoToolWrapper>
    </DemoLayout>
  );
}
