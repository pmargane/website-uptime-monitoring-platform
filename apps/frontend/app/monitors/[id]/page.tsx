import MonitorDetailsPageComponent from "@/components/MonitorPageComponent";

export default async function MonitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return <MonitorDetailsPageComponent id={id} />;
}
