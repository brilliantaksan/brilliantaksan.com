export type SocialIcon = 'instagram' | 'github' | 'linkedin' | 'youtube' | 'mail' | 'globe';

export interface SocialLink {
  name: string;
  url: string;
  icon: SocialIcon;
}

export interface BookingOption {
  emoji: string;
  title: string;
  description: string;
}

export interface ProjectLink {
  type: string;
  href: string;
}

export interface WorkItem {
  company: string;
  href?: string;
  title: string;
  location?: string;
  start: string;
  end?: string;
  description: string;
  logo?: string;
  badges?: string[];
}

export interface EducationItem {
  school: string;
  href?: string;
  degree: string;
  start: string;
  end?: string;
  logo?: string;
}

export interface ProjectItem {
  title: string;
  href: string;
  dates: string;
  description: string;
  technologies: string[];
  image: string;
  video: string;
  links: ProjectLink[];
}

export interface CreativeItem {
  title: string;
  type: 'video' | 'photo';
  caption: string;
  client: string;
  year: string;
  image: string;
  video: string;
}

export interface SiteMeta {
  name: string;
  initials: string;
  title: string;
  description: string;
  url: string;
  avatarUrl: string;
  location: string;
  email: string;
  seoImage: string;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  intro: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

export interface BookingContent {
  title: string;
  intro: string;
  embedUrl: string;
  options: BookingOption[];
}

export interface ContactContent {
  title: string;
  body: string;
}

export interface SiteContent {
  meta: SiteMeta;
  hero: HeroContent;
  about: string[];
  work: WorkItem[];
  education: EducationItem[];
  skills: string[];
  socials: SocialLink[];
  booking: BookingContent;
  projects: ProjectItem[];
  creative: CreativeItem[];
  contact: ContactContent;
}
