import { SidebarTrigger } from "@bullstudio/ui/components/sidebar";
import { Separator } from "@bullstudio/ui/components/separator";

type WorkspaceJobsPageProps = {
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceJobsPage({
  params,
}: WorkspaceJobsPageProps) {
  const { workspace } = await params;

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Jobs</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Jobs for workspace {workspace} coming soon...</p>
        </div>
      </main>
    </div>
  );
}
