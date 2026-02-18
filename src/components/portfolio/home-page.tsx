'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Play,
  Youtube
} from 'lucide-react';
import { type CSSProperties, useMemo, useState } from 'react';
import { BlurFade } from '@/components/magic/blur-fade';
import { ProjectCard } from '@/components/portfolio/project-card';
import { Badge } from '@/components/ui/badge';
import { designTokens } from '@/lib/design';
import type { EducationItem, SiteContent, SocialIcon, WorkItem } from '@/lib/types';

const BLUR_FADE_DELAY = 0.05;
const GLOBAL_TYPE_SCALE = designTokens.typography.globalScale ?? 1;
const GLOBAL_LINE_HEIGHT_SCALE = designTokens.typography.globalLineHeight ?? 1;
const DEFAULT_PROJECTS_SECTION = {
  label: 'Projects',
  title: "See What I'm Working On",
  description: "This site is just a collection of what I've been building."
};
const DEFAULT_CREATIVE_SECTION = {
  label: 'Creative Portfolio',
  title: 'Video + Photo Work',
  description: 'Creative projects and visual stories from recent collaborations and experiments.'
};

const socialIconMap: Record<SocialIcon, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  instagram: Instagram,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  mail: Mail,
  globe: Globe
};

function typeStyle(token: { size: string; scale?: number; lineHeight: number; letterSpacing: string }): CSSProperties {
  const tokenScale = token.scale ?? 1;
  return {
    fontSize: `calc(${token.size} * ${GLOBAL_TYPE_SCALE} * ${tokenScale})`,
    lineHeight: token.lineHeight * GLOBAL_LINE_HEIGHT_SCALE,
    letterSpacing: token.letterSpacing
  };
}

const typeStyles = {
  location: typeStyle(designTokens.typography.location),
  heroTitle: typeStyle(designTokens.typography.heroTitle),
  heroLead: typeStyle(designTokens.typography.heroLead),
  body: typeStyle(designTokens.typography.body),
  sectionTitle: typeStyle(designTokens.typography.sectionTitle),
  showcaseTitle: typeStyle(designTokens.typography.showcaseTitle),
  showcaseBody: typeStyle(designTokens.typography.showcaseBody),
  cardTitle: typeStyle(designTokens.typography.cardTitle),
  meta: typeStyle(designTokens.typography.meta),
  pill: typeStyle(designTokens.typography.pill)
};

const rowDescriptionStyle: CSSProperties = typeStyles.meta;
const heroTitleMaxSize = typeof typeStyles.heroTitle.fontSize === 'number' ? `${typeStyles.heroTitle.fontSize}px` : typeStyles.heroTitle.fontSize;
const heroLeadMaxSize = typeof typeStyles.heroLead.fontSize === 'number' ? `${typeStyles.heroLead.fontSize}px` : typeStyles.heroLead.fontSize;
const heroBodyMaxSize = typeof typeStyles.body.fontSize === 'number' ? `${typeStyles.body.fontSize}px` : typeStyles.body.fontSize;
const ctaLabelMaxSize = typeof typeStyles.meta.fontSize === 'number' ? `${typeStyles.meta.fontSize}px` : typeStyles.meta.fontSize;
const heroTitleMobileStyle: CSSProperties = {
  ...typeStyles.heroTitle,
  fontSize: `clamp(1.95rem, 9vw, ${heroTitleMaxSize})`,
  lineHeight: 1.05
};
const heroLeadMobileStyle: CSSProperties = {
  ...typeStyles.heroLead,
  fontSize: `clamp(1.15rem, 5vw, ${heroLeadMaxSize})`,
  lineHeight: 1.2
};
const heroBodyMobileStyle: CSSProperties = {
  ...typeStyles.body,
  fontSize: `clamp(1rem, 4.3vw, ${heroBodyMaxSize})`,
  lineHeight: 1.45
};
const heroLeadResponsiveStyle: CSSProperties = {
  ...typeStyles.heroLead,
  fontSize: `clamp(1.15rem, 2.4vw, ${heroLeadMaxSize})`,
  lineHeight: 1.2
};
const heroBodyResponsiveStyle: CSSProperties = {
  ...typeStyles.body,
  fontSize: `clamp(1rem, 1.85vw, ${heroBodyMaxSize})`,
  lineHeight: 1.45
};
const ctaLabelStyle: CSSProperties = {
  ...typeStyles.meta,
  fontSize: `clamp(0.78rem, 2.8vw, ${ctaLabelMaxSize})`,
  lineHeight: 1.2
};

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function WorkRow({ item }: { item: WorkItem }) {
  const companyNode = item.href ? (
    <a href={item.href} target="_blank" rel="noreferrer" className="transition hover:underline hover:decoration-primary/70">
      {item.company}
    </a>
  ) : (
    item.company
  );

  return (
    <article className="grid grid-cols-[auto_1fr] gap-3 py-4 sm:gap-4">
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground">
        {item.logo ? <img src={item.logo} alt={item.company} className="h-full w-full object-cover" /> : getInitials(item.company)}
      </div>
      <div className="min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-none text-foreground" style={typeStyles.cardTitle}>
              {companyNode}
            </h3>
            <p className="mt-1 text-muted-foreground" style={typeStyles.meta}>
              {item.title}
              {item.location ? ` · ${item.location}` : ''}
            </p>
          </div>
          <p className="tabular-nums text-muted-foreground" style={typeStyles.meta}>
            {item.start} - {item.end || 'Present'}
          </p>
        </div>
        {item.badges && item.badges.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.badges.map((badge) => (
              <Badge key={`${item.company}-${badge}`} variant="secondary" className="px-2 py-0 text-foreground/90" style={typeStyles.pill}>
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-muted-foreground" style={rowDescriptionStyle}>
          {item.description}
        </p>
      </div>
    </article>
  );
}

function EducationRow({ item }: { item: EducationItem }) {
  const schoolNode = item.href ? (
    <a href={item.href} target="_blank" rel="noreferrer" className="transition hover:underline hover:decoration-primary/70">
      {item.school}
    </a>
  ) : (
    item.school
  );

  return (
    <article className="grid grid-cols-[auto_1fr] gap-3 py-4 sm:gap-4">
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground">
        {item.logo ? <img src={item.logo} alt={item.school} className="h-full w-full object-cover" /> : getInitials(item.school)}
      </div>
      <div className="min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h3 className="font-semibold leading-none text-foreground" style={typeStyles.cardTitle}>
              {schoolNode}
            </h3>
            <p className="mt-1 text-muted-foreground" style={typeStyles.meta}>{item.degree}</p>
          </div>
          <p className="tabular-nums text-muted-foreground" style={typeStyles.meta}>
            {item.start} - {item.end || 'Present'}
          </p>
        </div>
      </div>
    </article>
  );
}

export function HomePage({ content }: { content: SiteContent }) {
  const [creativeFilter, setCreativeFilter] = useState<'all' | 'video' | 'photo'>('all');
  const projectsSection = { ...DEFAULT_PROJECTS_SECTION, ...(content.projectsSection ?? {}) };
  const creativeSection = { ...DEFAULT_CREATIVE_SECTION, ...(content.creativeSection ?? {}) };
  const contactEmail = content.contact.ctaEmail?.trim() || content.meta.email;

  const filteredCreative = useMemo(
    () =>
      creativeFilter === 'all'
        ? content.creative
        : content.creative.filter((item) => item.type === creativeFilter),
    [creativeFilter, content.creative]
  );

  return (
    <main
      className="mx-auto flex w-full flex-col pb-28 pt-8 sm:pt-12"
      style={{ maxWidth: designTokens.layout.maxWidthPx, gap: designTokens.layout.sectionGapPx }}
    >
      <section id="home" className="space-y-6">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl" style={{ display: 'grid', gap: designTokens.spacing.heroStackPx }}>
              <p className="uppercase text-muted-foreground" style={typeStyles.location}>{content.meta.location}</p>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 md:block">
                <div className="min-w-0 space-y-2">
                  <h1 className="font-extrabold text-foreground" style={heroTitleMobileStyle}>
                    {content.hero.headline}
                  </h1>
                  <p className="max-w-2xl font-medium text-foreground/95 md:hidden" style={heroLeadMobileStyle}>
                    {content.hero.subheadline}
                  </p>
                  <p className="max-w-2xl text-muted-foreground md:hidden" style={heroBodyMobileStyle}>{content.hero.intro}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 md:hidden">
                    {content.socials.map((social) => {
                      const Icon = socialIconMap[social.icon] ?? Globe;
                      return (
                        <a
                          key={`mobile-${social.name}`}
                          href={social.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-border px-3 py-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          title={social.name}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.8} />
                        </a>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-shrink-0 md:hidden">
                  <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-card shadow-sm">
                    <img src={content.meta.avatarUrl} alt={content.meta.name} className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
              <p className="hidden max-w-2xl font-medium text-foreground/95 md:block" style={heroLeadResponsiveStyle}>
                {content.hero.subheadline}
              </p>
              <p className="hidden max-w-2xl text-muted-foreground md:block" style={heroBodyResponsiveStyle}>{content.hero.intro}</p>
              <div className="hidden flex-wrap items-center gap-2 pt-1 md:flex">
                {content.socials.map((social) => {
                  const Icon = socialIconMap[social.icon] ?? Globe;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-border px-3 py-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      title={social.name}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="hidden flex-shrink-0 md:block">
              <div className="h-28 w-28 overflow-hidden rounded-full border border-border bg-card shadow-sm sm:h-32 sm:w-32">
                <img src={content.meta.avatarUrl} alt={content.meta.name} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 2} className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:gap-3">
          <a
            href="#booking"
            className="inline-flex w-full min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-primary px-2.5 py-2 text-center font-semibold text-primary-foreground shadow-md transition hover:brightness-95 sm:w-auto sm:px-5 sm:py-2.5"
            style={ctaLabelStyle}
          >
            {content.hero.primaryCtaLabel}
          </a>
          <a
            href="#projects"
            className="inline-flex w-full min-h-[44px] items-center justify-center whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-2 text-center font-semibold transition hover:bg-secondary sm:w-auto sm:px-5 sm:py-2.5"
            style={ctaLabelStyle}
          >
            {content.hero.secondaryCtaLabel}
          </a>
        </BlurFade>
      </section>

      <section id="about" className="space-y-5">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h2 className="font-bold tracking-tight text-foreground" style={typeStyles.sectionTitle}>About</h2>
        </BlurFade>
        <div style={{ display: 'grid', gap: designTokens.spacing.sectionStackPx }}>
          {content.about.map((paragraph, index) => (
            <BlurFade key={paragraph} delay={BLUR_FADE_DELAY + index * 0.05}>
              <p className="text-muted-foreground" style={rowDescriptionStyle}>{paragraph}</p>
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="experience" className="space-y-5">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h2 className="font-bold tracking-tight text-foreground" style={typeStyles.sectionTitle}>Experience</h2>
        </BlurFade>
        <div className="divide-y divide-border/70">
          {content.work.map((item, index) => (
            <BlurFade key={`${item.company}-${item.start}`} delay={BLUR_FADE_DELAY + index * 0.04}>
              <WorkRow item={item} />
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="education" className="space-y-5">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h2 className="font-bold tracking-tight text-foreground" style={typeStyles.sectionTitle}>Education</h2>
        </BlurFade>
        <div className="divide-y divide-border/70">
          {content.education.map((item, index) => (
            <BlurFade key={`${item.school}-${item.start}`} delay={BLUR_FADE_DELAY + index * 0.04}>
              <EducationRow item={item} />
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="skills" className="space-y-5">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h2 className="font-bold tracking-tight text-foreground" style={typeStyles.sectionTitle}>Skills</h2>
        </BlurFade>
        <div className="flex flex-wrap gap-2">
          {content.skills.map((skill, index) => (
            <BlurFade key={skill} delay={BLUR_FADE_DELAY + index * 0.02}>
              <Badge variant="secondary" className="rounded-full px-3 py-1 font-semibold" style={typeStyles.pill}>
                {skill}
              </Badge>
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="projects" className="space-y-8 pt-3">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className="space-y-3 text-center">
            <p className="mx-auto inline-flex rounded-full border border-border bg-card px-3 py-1 uppercase text-muted-foreground" style={typeStyles.pill}>
              {projectsSection.label}
            </p>
            <h2 className="font-extrabold tracking-tight text-foreground" style={typeStyles.showcaseTitle}>
              {projectsSection.title}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground" style={typeStyles.showcaseBody}>
              {projectsSection.description}
            </p>
          </div>
        </BlurFade>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {content.projects.map((project, index) => (
            <BlurFade key={project.title} delay={BLUR_FADE_DELAY * 1.5 + index * 0.06}>
              <ProjectCard project={project} />
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="creative" className="space-y-7 pt-2">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className="space-y-2 text-center">
            <p className="mx-auto inline-flex rounded-full border border-border bg-card px-3 py-1 uppercase text-muted-foreground" style={typeStyles.pill}>
              {creativeSection.label}
            </p>
            <h2 className="font-extrabold tracking-tight text-foreground" style={typeStyles.showcaseTitle}>
              {creativeSection.title}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground" style={typeStyles.showcaseBody}>
              {creativeSection.description}
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 1.3} className="flex flex-wrap justify-center gap-2">
          {(['all', 'video', 'photo'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCreativeFilter(type)}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                creativeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card hover:bg-secondary'
              }`}
              style={typeStyles.pill}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </BlurFade>

        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredCreative.map((item, index) => {
              const mediaNode = item.video ? (
                <video
                  src={item.video}
                  className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
              ) : (
                <div className="flex h-52 items-center justify-center bg-secondary">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              );

              return (
                <motion.article
                  key={`${item.title}-${item.year}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.24, delay: index * 0.03 }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="block">
                      {mediaNode}
                    </a>
                  ) : (
                    mediaNode
                  )}

                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold" style={typeStyles.cardTitle}>{item.title}</h3>
                      <span className="uppercase text-muted-foreground" style={typeStyles.pill}>{item.year}</span>
                    </div>
                    <p className="text-muted-foreground" style={typeStyles.meta}>{item.caption}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="rounded-full bg-secondary px-2 py-1 text-muted-foreground" style={typeStyles.pill}>
                        {item.client}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground" style={typeStyles.pill}>
                        {item.type === 'video' ? <Play className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                        {item.type === 'video' ? 'Video' : 'Photo'}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>

      <section id="booking" className="space-y-6">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h2 className="font-bold tracking-tight text-foreground" style={typeStyles.sectionTitle}>
            {content.booking.title}
          </h2>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 1.2}>
          <p className="max-w-3xl text-muted-foreground" style={typeStyles.body}>
            {content.booking.intro}
          </p>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 1.4}>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.booking.options.map((option, index) => (
              <BlurFade key={option.title} delay={BLUR_FADE_DELAY * 1.6 + index * 0.05}>
                <div className="h-full rounded-2xl border border-border bg-card/70 p-4">
                  <p className="text-xl">{option.emoji}</p>
                  <h3 className="mt-2 font-semibold text-foreground" style={typeStyles.cardTitle}>{option.title}</h3>
                  <p className="mt-1 text-muted-foreground" style={typeStyles.meta}>{option.description}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 1.2}>
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <iframe
              src={content.booking.embedUrl}
              title="Book a free listening session with Brilliant Aksan"
              className="h-[400px] w-full sm:h-[440px] lg:h-[540px]"
              loading="lazy"
            />
          </div>
        </BlurFade>
      </section>

      <section id="contact" className="space-y-4 rounded-3xl border border-border bg-card/80 p-7 text-center">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h2 className="font-bold tracking-tight text-foreground" style={typeStyles.sectionTitle}>{content.contact.title}</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 1.4}>
          <p className="mx-auto max-w-2xl text-muted-foreground" style={typeStyles.body}>{content.contact.body}</p>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 1.8} className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
            style={typeStyles.meta}
          >
            Email {content.meta.name}
          </a>
        </BlurFade>
      </section>
    </main>
  );
}
