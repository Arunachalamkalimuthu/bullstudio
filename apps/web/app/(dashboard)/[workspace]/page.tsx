import { SidebarTrigger } from "@bullstudio/ui/components/sidebar";
import { Separator } from "@bullstudio/ui/components/separator";
import { OverviewContent } from "@/components/overview";

export default async function WorkspaceOverviewPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Overview</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-auto p-6">
        <OverviewContent />
      </main>
    </div>
  );
}
