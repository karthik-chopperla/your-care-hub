import { SymptomChecker } from "@/components/SymptomChecker";
import MobileLayout from "@/components/MobileLayout";

export default function SymptomCheckerPage() {
  return (
    <MobileLayout showNavigation={true} className="bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
      <SymptomChecker />
    </MobileLayout>
  );
}