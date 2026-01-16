import OrgAuthWrapper from "./OrgAuthWrapper";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  return <OrgAuthWrapper params={params}>{children}</OrgAuthWrapper>;
}
