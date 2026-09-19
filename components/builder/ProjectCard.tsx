import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/brand/Reveal";
import type { Project } from "@/lib/types";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <Reveal delay={(index % 3) * 0.08}>
      <Link href={`/projects/${project.slug}`} className="group block">
        <article className="img-frame img-veil relative aspect-[4/3] rounded-sm shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
          {project.main_image_url ? (
            <Image src={project.main_image_url} alt={`${project.name} — ${project.location ?? "project"} view`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
          ) : null}
          <div className="absolute left-4 top-4 rounded-full bg-navy-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300 backdrop-blur-md">
            {project.project_type === "residential" ? "Residential" : "Commercial"}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="font-display text-xl leading-snug text-ivory-50">{project.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ivory-200/75">{project.location}</p>
          </div>
        </article>
      </Link>
    </Reveal>
  );
}
