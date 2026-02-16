import { Camera, Github, Globe, Linkedin, Youtube } from 'lucide-react';
import { designTokens } from '@/lib/design';
import { Badge } from '@/components/ui/badge';
import type { ProjectItem, ProjectLink } from '@/lib/types';

function linkIcon(type: string) {
  const value = type.toLowerCase();
  if (value.includes('github')) return Github;
  if (value.includes('linkedin')) return Linkedin;
  if (value.includes('youtube')) return Youtube;
  return Globe;
}

function LinkPill({ link }: { link: ProjectLink }) {
  const Icon = linkIcon(link.type);

  return (
    <a href={link.href} target="_blank" rel="noreferrer" className="inline-flex">
      <Badge variant="outline" className="gap-1 px-2 py-1 text-[11px]">
        <Icon className="h-3 w-3" />
        {link.type}
      </Badge>
    </a>
  );
}

export function ProjectCard({ project }: { project: ProjectItem }) {
  const globalTypeScale = designTokens.typography.globalScale ?? 1;
  const globalLineHeightScale = designTokens.typography.globalLineHeight ?? 1;
  const cardTitleScale = designTokens.typography.cardTitle.scale ?? 1;
  const metaScale = designTokens.typography.meta.scale ?? 1;
  const pillScale = designTokens.typography.pill.scale ?? 1;

  const cardTitleStyle = {
    fontSize: `calc(${designTokens.typography.cardTitle.size} * ${globalTypeScale} * ${cardTitleScale})`,
    lineHeight: designTokens.typography.cardTitle.lineHeight * globalLineHeightScale,
    letterSpacing: designTokens.typography.cardTitle.letterSpacing
  };

  const bodyStyle = {
    fontSize: `calc(${designTokens.typography.meta.size} * ${globalTypeScale} * ${metaScale})`,
    lineHeight: designTokens.typography.meta.lineHeight * globalLineHeightScale,
    letterSpacing: designTokens.typography.meta.letterSpacing
  };

  const pillStyle = {
    fontSize: `calc(${designTokens.typography.pill.size} * ${globalTypeScale} * ${pillScale})`,
    lineHeight: designTokens.typography.pill.lineHeight * globalLineHeightScale,
    letterSpacing: designTokens.typography.pill.letterSpacing
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/95 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <a href={project.href || '#'} target="_blank" rel="noreferrer" className="block">
        {project.video ? (
          <video
            className="h-48 w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
            src={project.video}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : project.image ? (
          <img
            className="h-48 w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
            src={project.image}
            alt={project.title}
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-secondary">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </a>

      <div className="space-y-2 p-4 sm:p-5">
        <div className="space-y-1">
          <h3 className="font-semibold tracking-tight" style={cardTitleStyle}>{project.title}</h3>
          <p className="text-muted-foreground" style={bodyStyle}>{project.dates}</p>
          <p className="text-muted-foreground" style={bodyStyle}>{project.description}</p>
        </div>

        <div className="flex flex-wrap gap-1 pt-1">
          {project.technologies.map((skill) => (
            <Badge key={skill} variant="secondary" className="px-2 py-0.5" style={pillStyle}>
              {skill}
            </Badge>
          ))}
        </div>

        {project.links?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.links.map((link) => (
              <LinkPill key={`${project.title}-${link.type}-${link.href}`} link={link} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
