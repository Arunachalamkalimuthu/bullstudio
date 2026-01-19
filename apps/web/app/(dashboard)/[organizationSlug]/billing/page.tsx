import { PageHeader } from "@/components/shell/PageHeader";
import { BillingContent } from "@/components/billing";

export default function BillingPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Billing" />
      <main className="flex-1 min-h-0 overflow-auto p-6">
        <BillingContent />
      </main>
    </div>
  );
}
