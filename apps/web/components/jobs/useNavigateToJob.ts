import { useParams, useRouter } from "next/navigation";

export const useNavigateToJob = () => {
  const router = useRouter();
  const params = useParams();
  const { organizationSlug, workspace } = params as {
    organizationSlug: string;
    workspace: string;
  };

  const navigateToJob = (
    jobId: string,
    connectionId: string,
    queueName: string
  ) =>
    router.push(
      `/${organizationSlug}/${workspace}/jobs/${jobId}?connectionId=${connectionId}&queueName=${encodeURIComponent(queueName)}`
    );

  return navigateToJob;
};
