import { SidebarTrigger } from "@bullstudio/ui/components/sidebar";
import { Separator } from "@bullstudio/ui/components/separator";
import { JobDetail } from "@/components/jobs";

type JobDetailPageProps = {
  params: Promise<{ workspace: string; jobId: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { workspace, jobId } = await params;
  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Job Details</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-auto p-6">
        <JobDetail workspace={workspace} jobId={decodeURIComponent(jobId)} />
      </main>
    </div>
  );
}
