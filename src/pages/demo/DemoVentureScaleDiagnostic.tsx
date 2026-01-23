import { DemoLayout } from "@/components/demo/DemoLayout";
import { DemoToolWrapper } from "@/components/demo/DemoToolWrapper";
import VentureScaleDiagnostic from "@/pages/VentureScaleDiagnostic";

export default function DemoVentureScaleDiagnostic() {
  return (
    <DemoLayout currentPage="dashboard">
      <DemoToolWrapper
        toolName="Venture Scale Diagnostic"
        toolDescription="Create an account to analyze your venture's scalability potential with AI-powered insights."
      >
        <VentureScaleDiagnostic />
      </DemoToolWrapper>
    </DemoLayout>
  );
}
