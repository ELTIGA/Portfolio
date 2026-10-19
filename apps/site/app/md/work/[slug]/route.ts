import { getProject, projects } from "@portfolio/content";
import { markdownResponse, projectMarkdown } from "@/lib/markdown";

// Served at /work/[slug].md through a rewrite in next.config.ts: a dynamic segment can't
// carry a literal ".md" suffix.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return new Response("Not found", { status: 404 });
  return markdownResponse(projectMarkdown(project), `/work/${project.slug}`);
}
