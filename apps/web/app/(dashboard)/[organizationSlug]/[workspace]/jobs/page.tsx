import { PageHeader } from "@/components/shell/PageHeader";
import { JobsContent } from "@/components/jobs";

export default async function WorkspaceJobsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Jobs" />
      <main className="flex-1 min-h-0 overflow-auto p-6">
        <JobsContent />
      </main>
    </div>
  );
}
