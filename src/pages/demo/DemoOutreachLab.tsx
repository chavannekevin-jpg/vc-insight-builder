import { DemoLayout } from "@/components/demo/DemoLayout";
import { DemoToolWrapper } from "@/components/demo/DemoToolWrapper";
import InvestorEmailGenerator from "@/pages/InvestorEmailGenerator";

export default function DemoOutreachLab() {
  return (
    <DemoLayout currentPage="dashboard">
      <DemoToolWrapper
        toolName="Outreach Lab"
        toolDescription="Create an account to generate personalized investor outreach emails based on your company profile."
      >
        <InvestorEmailGenerator />
      </DemoToolWrapper>
    </DemoLayout>
  );
}
