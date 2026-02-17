import ProjectDetailClient from "./ProjectDetailClient";

export function generateStaticParams() {
  // Return a placeholder; actual routing handled client-side
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <ProjectDetailClient />;
}
