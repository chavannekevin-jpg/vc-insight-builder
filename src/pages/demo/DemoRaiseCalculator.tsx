import { DemoLayout } from "@/components/demo/DemoLayout";
import { DemoToolWrapper } from "@/components/demo/DemoToolWrapper";
import RaiseCalculator from "@/pages/RaiseCalculator";

export default function DemoRaiseCalculator() {
  return (
    <DemoLayout currentPage="dashboard">
      <DemoToolWrapper
        toolName="Raise Calculator"
        toolDescription="Create an account to calculate your optimal raise amount and get personalized funding recommendations."
      >
        <RaiseCalculator />
      </DemoToolWrapper>
    </DemoLayout>
  );
}
