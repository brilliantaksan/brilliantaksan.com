'use client';

import { ChevronDown, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ADMIN_CONTENT_SAVE_REQUEST_EVENT,
  ADMIN_CONTENT_SAVE_RESULT_EVENT,
  ADMIN_CONTENT_SAVE_STATE_EVENT
} from '@/lib/admin-content-events';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import type {
  BookingOption,
  CreativeItem,
  EducationItem,
  ProjectItem,
  ShowcaseSectionContent,
  SiteContent,
  SocialIcon,
  SocialLink,
  WorkItem
} from '@/lib/types';

const SOCIAL_ICONS: SocialIcon[] = ['instagram', 'github', 'linkedin', 'youtube', 'mail', 'globe'];
const DEFAULT_PROJECTS_SECTION: ShowcaseSectionContent = {
  label: 'Projects',
  title: "See What I'm Working On",
  description: "This site is just a collection of what I've been building."
};
const DEFAULT_CREATIVE_SECTION: ShowcaseSectionContent = {
  label: 'Creative Portfolio',
  title: 'Video + Photo Work',
  description: 'Creative projects and visual stories from recent collaborations and experiments.'
};

function cloneContent(content: SiteContent) {
  return JSON.parse(JSON.stringify(content)) as SiteContent;
}

function normalizeContent(content: SiteContent) {
  const next = cloneContent(content);
  next.projectsSection = {
    ...DEFAULT_PROJECTS_SECTION,
    ...(next.projectsSection ?? {})
  };
  next.creativeSection = {
    ...DEFAULT_CREATIVE_SECTION,
    ...(next.creativeSection ?? {})
  };
  return next;
}

function parseCommaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');
}

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return;
  const [moved] = items.splice(fromIndex, 1);
  if (!moved) return;
  items.splice(toIndex, 0, moved);
}

function MediaField({
  label,
  value,
  onChange,
  accept,
  folder
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  accept: string;
  folder: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const bucket = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || 'media', []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      const filePath = `${folder}/${Date.now()}-${sanitizeFilename(file.name)}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: false,
        cacheControl: '3600'
      });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(data.publicUrl);
      setFile(null);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  const looksLikeVideo = value.endsWith('.mp4') || value.endsWith('.mov') || value.endsWith('.webm');

  return (
    <div className="space-y-2 rounded-xl border border-border bg-background/70 p-3">
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <input
          type="file"
          accept={accept}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-border bg-background p-2 text-xs"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {value ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {looksLikeVideo ? (
            <video src={value} className="h-40 w-full object-cover" controls />
          ) : (
            <img src={value} alt={label} className="h-32 w-full object-cover" />
          )}
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function defaultWorkItem(): WorkItem {
  return {
    company: '',
    href: '',
    title: '',
    location: '',
    start: '',
    end: '',
    description: '',
    logo: '',
    badges: []
  };
}

function defaultProjectItem(): ProjectItem {
  return {
    title: '',
    href: '',
    dates: '',
    description: '',
    technologies: [],
    image: '',
    video: '',
    links: []
  };
}

function defaultCreativeItem(): CreativeItem {
  return {
    title: '',
    type: 'photo',
    href: '',
    caption: '',
    client: '',
    year: '',
    image: '',
    video: ''
  };
}

function defaultEducationItem(): EducationItem {
  return {
    school: '',
    href: '',
    degree: '',
    start: '',
    end: '',
    logo: ''
  };
}

function defaultBookingOption(): BookingOption {
  return {
    emoji: '📌',
    title: '',
    description: ''
  };
}

function defaultSocialLink(): SocialLink {
  return {
    name: '',
    url: '',
    icon: 'globe'
  };
}

export function ContentEditor() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggingProjectIndex, setDraggingProjectIndex] = useState<number | null>(null);
  const [draggingCreativeIndex, setDraggingCreativeIndex] = useState<number | null>(null);
  const [draggingWorkIndex, setDraggingWorkIndex] = useState<number | null>(null);
  const [draggingSocialIndex, setDraggingSocialIndex] = useState<number | null>(null);
  const [projectDropTargetIndex, setProjectDropTargetIndex] = useState<number | null>(null);
  const [creativeDropTargetIndex, setCreativeDropTargetIndex] = useState<number | null>(null);
  const [workDropTargetIndex, setWorkDropTargetIndex] = useState<number | null>(null);
  const [socialDropTargetIndex, setSocialDropTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/content', { cache: 'no-store' });
        const payload = (await response.json()) as { content?: SiteContent; error?: string };
        if (!response.ok || !payload.content) {
          throw new Error(payload.error || 'Failed to load content.');
        }
        if (isMounted) setContent(normalizeContent(payload.content));
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load content.';
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateContent(mutator: (draft: SiteContent) => void) {
    setContent((previous) => {
      if (!previous) return previous;
      const next = cloneContent(previous);
      mutator(next);
      return next;
    });
  }

  const saveContent = useCallback(async () => {
    if (!content || saving) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to save content.');
      }
      const successMessage = 'Saved successfully.';
      setSuccess(successMessage);
      window.dispatchEvent(
        new CustomEvent(ADMIN_CONTENT_SAVE_RESULT_EVENT, {
          detail: { status: 'success', message: successMessage }
        })
      );
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save content.';
      setError(message);
      window.dispatchEvent(
        new CustomEvent(ADMIN_CONTENT_SAVE_RESULT_EVENT, {
          detail: { status: 'error', message }
        })
      );
    } finally {
      setSaving(false);
    }
  }, [content, saving]);

  useEffect(() => {
    const onSaveRequest = () => {
      void saveContent();
    };

    window.addEventListener(ADMIN_CONTENT_SAVE_REQUEST_EVENT, onSaveRequest);
    return () => window.removeEventListener(ADMIN_CONTENT_SAVE_REQUEST_EVENT, onSaveRequest);
  }, [saveContent]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(ADMIN_CONTENT_SAVE_STATE_EVENT, {
        detail: { saving }
      })
    );
  }, [saving]);

  function dropProjectAt(toIndex: number) {
    if (draggingProjectIndex === null || draggingProjectIndex === toIndex) return;
    updateContent((draft) => {
      reorderItems(draft.projects, draggingProjectIndex, toIndex);
    });
  }

  function dropCreativeAt(toIndex: number) {
    if (draggingCreativeIndex === null || draggingCreativeIndex === toIndex) return;
    updateContent((draft) => {
      reorderItems(draft.creative, draggingCreativeIndex, toIndex);
    });
  }

  function dropWorkAt(toIndex: number) {
    if (draggingWorkIndex === null || draggingWorkIndex === toIndex) return;
    updateContent((draft) => {
      reorderItems(draft.work, draggingWorkIndex, toIndex);
    });
  }

  function dropSocialAt(toIndex: number) {
    if (draggingSocialIndex === null || draggingSocialIndex === toIndex) return;
    updateContent((draft) => {
      reorderItems(draft.socials, draggingSocialIndex, toIndex);
    });
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading content...</p>;
  }

  if (!content) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error || 'Failed to load content.'}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 pb-28">
        {success ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        ) : null}
        <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <h2 className="text-base font-semibold">Profile</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <input
              value={content.meta.name}
              onChange={(event) => updateContent((draft) => void (draft.meta.name = event.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Location</span>
            <input
              value={content.meta.location}
              onChange={(event) => updateContent((draft) => void (draft.meta.location = event.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <input
              value={content.meta.email}
              onChange={(event) => updateContent((draft) => void (draft.meta.email = event.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">SEO Title</span>
            <input
              value={content.meta.title}
              onChange={(event) => updateContent((draft) => void (draft.meta.title = event.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <MediaField
            label="Profile Picture"
            value={content.meta.avatarUrl}
            onChange={(nextValue) => updateContent((draft) => void (draft.meta.avatarUrl = nextValue))}
            accept="image/*"
            folder="profile"
          />
          <MediaField
            label="SEO Image"
            value={content.meta.seoImage}
            onChange={(nextValue) => updateContent((draft) => void (draft.meta.seoImage = nextValue))}
            accept="image/*"
            folder="profile"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <h2 className="text-base font-semibold">Hero</h2>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Headline</span>
          <input
            value={content.hero.headline}
            onChange={(event) => updateContent((draft) => void (draft.hero.headline = event.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Subheadline</span>
          <input
            value={content.hero.subheadline}
            onChange={(event) => updateContent((draft) => void (draft.hero.subheadline = event.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Intro</span>
          <textarea
            value={content.hero.intro}
            onChange={(event) => updateContent((draft) => void (draft.hero.intro = event.target.value))}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">About Lines</h2>
          <button
            type="button"
            onClick={() => updateContent((draft) => void draft.about.push(''))}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
          >
            Add Line
          </button>
        </div>
        <div className="space-y-2">
          {content.about.map((line, index) => (
            <div key={`about-${index}`} className="space-y-2 rounded-lg border border-border bg-background/70 p-3">
              <textarea
                value={line}
                onChange={(event) =>
                  updateContent((draft) => {
                    draft.about[index] = event.target.value;
                  })
                }
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  updateContent((draft) => {
                    draft.about.splice(index, 1);
                  })
                }
                className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Experience</h2>
          <button
            type="button"
            onClick={() => updateContent((draft) => void draft.work.push(defaultWorkItem()))}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
          >
            Add Experience
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Drag cards to reorder your experience entries.</p>
        <div className="space-y-3">
          {content.work.map((item, index) => (
            <div
              key={`work-${index}`}
              draggable
              onDragStart={(event) => {
                setDraggingWorkIndex(index);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setWorkDropTargetIndex(index);
              }}
              onDragLeave={() => {
                setWorkDropTargetIndex((current) => (current === index ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();
                dropWorkAt(index);
                setDraggingWorkIndex(null);
                setWorkDropTargetIndex(null);
              }}
              onDragEnd={() => {
                setDraggingWorkIndex(null);
                setWorkDropTargetIndex(null);
              }}
              className={`rounded-xl border bg-background/70 p-3 transition-colors ${
                workDropTargetIndex === index ? 'border-primary/70 bg-primary/5' : 'border-border'
              }`}
            >
              <details className="group space-y-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg bg-card/80 p-2.5 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                      {item.logo ? (
                        <img src={item.logo} alt={item.company || 'Company logo'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.company || `Experience ${index + 1}`}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[item.title, item.start && `${item.start} - ${item.end || 'Present'}`].filter(Boolean).join(' · ') || 'No details yet'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>

                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={item.company}
                      onChange={(event) => updateContent((draft) => void (draft.work[index].company = event.target.value))}
                      placeholder="Company"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={item.title}
                      onChange={(event) => updateContent((draft) => void (draft.work[index].title = event.target.value))}
                      placeholder="Title"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={item.location || ''}
                      onChange={(event) => updateContent((draft) => void (draft.work[index].location = event.target.value))}
                      placeholder="Location"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={item.href || ''}
                      onChange={(event) => updateContent((draft) => void (draft.work[index].href = event.target.value))}
                      placeholder="Company URL"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={item.start}
                      onChange={(event) => updateContent((draft) => void (draft.work[index].start = event.target.value))}
                      placeholder="Start"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={item.end || ''}
                      onChange={(event) => updateContent((draft) => void (draft.work[index].end = event.target.value))}
                      placeholder="End"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(event) => updateContent((draft) => void (draft.work[index].description = event.target.value))}
                    placeholder="Description"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <input
                    value={(item.badges || []).join(', ')}
                    onChange={(event) =>
                      updateContent((draft) => {
                        draft.work[index].badges = parseCommaList(event.target.value);
                      })
                    }
                    placeholder="Badges (comma separated)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <MediaField
                    label="Logo Image"
                    value={item.logo || ''}
                    onChange={(nextValue) => updateContent((draft) => void (draft.work[index].logo = nextValue))}
                    accept="image/*"
                    folder="work"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateContent((draft) => {
                        draft.work.splice(index, 1);
                      })
                    }
                    className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                  >
                    Remove Experience
                  </button>
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Projects</h2>
          <button
            type="button"
            onClick={() => updateContent((draft) => void draft.projects.push(defaultProjectItem()))}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
          >
            Add Project
          </button>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Section Label</span>
            <input
              value={content.projectsSection?.label ?? DEFAULT_PROJECTS_SECTION.label}
              onChange={(event) =>
                updateContent((draft) => {
                  draft.projectsSection = draft.projectsSection ?? { ...DEFAULT_PROJECTS_SECTION };
                  draft.projectsSection.label = event.target.value;
                })
              }
              placeholder="Projects"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Section Title</span>
            <input
              value={content.projectsSection?.title ?? DEFAULT_PROJECTS_SECTION.title}
              onChange={(event) =>
                updateContent((draft) => {
                  draft.projectsSection = draft.projectsSection ?? { ...DEFAULT_PROJECTS_SECTION };
                  draft.projectsSection.title = event.target.value;
                })
              }
              placeholder="See What I'm Working On"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Section Description</span>
            <textarea
              value={content.projectsSection?.description ?? DEFAULT_PROJECTS_SECTION.description}
              onChange={(event) =>
                updateContent((draft) => {
                  draft.projectsSection = draft.projectsSection ?? { ...DEFAULT_PROJECTS_SECTION };
                  draft.projectsSection.description = event.target.value;
                })
              }
              rows={2}
              placeholder="This site is just a collection of what I've been building."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Drag any card by its handle to reorder.</p>
        <div className="space-y-3">
          {content.projects.map((project, projectIndex) => (
            <div
              key={`project-${projectIndex}`}
              draggable
              onDragStart={(event) => {
                setDraggingProjectIndex(projectIndex);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setProjectDropTargetIndex(projectIndex);
              }}
              onDragLeave={() => {
                setProjectDropTargetIndex((current) => (current === projectIndex ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();
                dropProjectAt(projectIndex);
                setDraggingProjectIndex(null);
                setProjectDropTargetIndex(null);
              }}
              onDragEnd={() => {
                setDraggingProjectIndex(null);
                setProjectDropTargetIndex(null);
              }}
              className={`rounded-xl border bg-background/70 p-3 transition-colors ${
                projectDropTargetIndex === projectIndex ? 'border-primary/70 bg-primary/5' : 'border-border'
              }`}
            >
              <details className="group space-y-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg bg-card/80 p-2.5 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                      {project.video ? (
                        <video src={project.video} className="h-full w-full object-cover" muted playsInline />
                      ) : project.image ? (
                        <img src={project.image} alt={project.title || 'Project thumbnail'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {project.title || `Project ${projectIndex + 1}`}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.video ? 'Has video preview' : project.image ? 'Has image preview' : 'No media added'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>

                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={project.title}
                      onChange={(event) => updateContent((draft) => void (draft.projects[projectIndex].title = event.target.value))}
                      placeholder="Project Title"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={project.dates}
                      onChange={(event) => updateContent((draft) => void (draft.projects[projectIndex].dates = event.target.value))}
                      placeholder="Dates"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={project.href || ''}
                      onChange={(event) => updateContent((draft) => void (draft.projects[projectIndex].href = event.target.value))}
                      placeholder="Primary URL"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                    />
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(event) => updateContent((draft) => void (draft.projects[projectIndex].description = event.target.value))}
                    placeholder="Project Description"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <input
                    value={(project.technologies || []).join(', ')}
                    onChange={(event) =>
                      updateContent((draft) => {
                        draft.projects[projectIndex].technologies = parseCommaList(event.target.value);
                      })
                    }
                    placeholder="Technologies (comma separated)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <MediaField
                      label="Thumbnail Image"
                      value={project.image || ''}
                      onChange={(nextValue) => updateContent((draft) => void (draft.projects[projectIndex].image = nextValue))}
                      accept="image/*"
                      folder="projects"
                    />
                    <MediaField
                      label="Project Video"
                      value={project.video || ''}
                      onChange={(nextValue) => updateContent((draft) => void (draft.projects[projectIndex].video = nextValue))}
                      accept="video/*"
                      folder="projects"
                    />
                  </div>

                  <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Project Links</p>
                      <button
                        type="button"
                        onClick={() =>
                          updateContent((draft) => {
                            draft.projects[projectIndex].links.push({ type: '', href: '' });
                          })
                        }
                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                      >
                        Add Link
                      </button>
                    </div>
                    {project.links.map((link, linkIndex) => (
                      <div key={`project-${projectIndex}-link-${linkIndex}`} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                        <input
                          value={link.type}
                          onChange={(event) =>
                            updateContent((draft) => {
                              draft.projects[projectIndex].links[linkIndex].type = event.target.value;
                            })
                          }
                          placeholder="Type"
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                        <input
                          value={link.href}
                          onChange={(event) =>
                            updateContent((draft) => {
                              draft.projects[projectIndex].links[linkIndex].href = event.target.value;
                            })
                          }
                          placeholder="URL"
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateContent((draft) => {
                              draft.projects[projectIndex].links.splice(linkIndex, 1);
                            })
                          }
                          className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateContent((draft) => {
                        draft.projects.splice(projectIndex, 1);
                      })
                    }
                    className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                  >
                    Remove Project
                  </button>
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Video / Photo Projects</h2>
          <button
            type="button"
            onClick={() => updateContent((draft) => void draft.creative.push(defaultCreativeItem()))}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
          >
            Add Creative Item
          </button>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Section Label</span>
            <input
              value={content.creativeSection?.label ?? DEFAULT_CREATIVE_SECTION.label}
              onChange={(event) =>
                updateContent((draft) => {
                  draft.creativeSection = draft.creativeSection ?? { ...DEFAULT_CREATIVE_SECTION };
                  draft.creativeSection.label = event.target.value;
                })
              }
              placeholder="Creative Portfolio"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Section Title</span>
            <input
              value={content.creativeSection?.title ?? DEFAULT_CREATIVE_SECTION.title}
              onChange={(event) =>
                updateContent((draft) => {
                  draft.creativeSection = draft.creativeSection ?? { ...DEFAULT_CREATIVE_SECTION };
                  draft.creativeSection.title = event.target.value;
                })
              }
              placeholder="Video + Photo Work"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Section Description</span>
            <textarea
              value={content.creativeSection?.description ?? DEFAULT_CREATIVE_SECTION.description}
              onChange={(event) =>
                updateContent((draft) => {
                  draft.creativeSection = draft.creativeSection ?? { ...DEFAULT_CREATIVE_SECTION };
                  draft.creativeSection.description = event.target.value;
                })
              }
              rows={2}
              placeholder="Creative projects and visual stories from recent collaborations and experiments."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Drag cards to reorder your creative showcase.</p>
        <div className="space-y-3">
          {content.creative.map((item, index) => (
            <div
              key={`creative-${index}`}
              draggable
              onDragStart={(event) => {
                setDraggingCreativeIndex(index);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setCreativeDropTargetIndex(index);
              }}
              onDragLeave={() => {
                setCreativeDropTargetIndex((current) => (current === index ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();
                dropCreativeAt(index);
                setDraggingCreativeIndex(null);
                setCreativeDropTargetIndex(null);
              }}
              onDragEnd={() => {
                setDraggingCreativeIndex(null);
                setCreativeDropTargetIndex(null);
              }}
              className={`rounded-xl border bg-background/70 p-3 transition-colors ${
                creativeDropTargetIndex === index ? 'border-primary/70 bg-primary/5' : 'border-border'
              }`}
            >
              <details className="group space-y-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg bg-card/80 p-2.5 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                      {item.video ? (
                        <video src={item.video} className="h-full w-full object-cover" muted playsInline />
                      ) : item.image ? (
                        <img src={item.image} alt={item.title || 'Creative preview'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title || `Creative ${index + 1}`}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.type === 'video' ? 'Video project' : 'Photo project'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>

                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={item.title}
                      onChange={(event) => updateContent((draft) => void (draft.creative[index].title = event.target.value))}
                      placeholder="Title"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={item.type}
                      onChange={(event) =>
                        updateContent((draft) => void (draft.creative[index].type = event.target.value as CreativeItem['type']))
                      }
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      value={item.client}
                      onChange={(event) => updateContent((draft) => void (draft.creative[index].client = event.target.value))}
                      placeholder="Client"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={item.year}
                      onChange={(event) => updateContent((draft) => void (draft.creative[index].year = event.target.value))}
                      placeholder="Year"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={item.href || ''}
                      onChange={(event) => updateContent((draft) => void (draft.creative[index].href = event.target.value))}
                      placeholder="Primary URL"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                    />
                  </div>
                  <textarea
                    value={item.caption}
                    onChange={(event) => updateContent((draft) => void (draft.creative[index].caption = event.target.value))}
                    rows={2}
                    placeholder="Caption"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <MediaField
                      label="Image"
                      value={item.image || ''}
                      onChange={(nextValue) => updateContent((draft) => void (draft.creative[index].image = nextValue))}
                      accept="image/*"
                      folder="creative"
                    />
                    <MediaField
                      label="Video"
                      value={item.video || ''}
                      onChange={(nextValue) => updateContent((draft) => void (draft.creative[index].video = nextValue))}
                      accept="video/*"
                      folder="creative"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateContent((draft) => {
                        draft.creative.splice(index, 1);
                      })
                    }
                    className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                  >
                    Remove Creative Item
                  </button>
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Education</h2>
          <button
            type="button"
            onClick={() => updateContent((draft) => void draft.education.push(defaultEducationItem()))}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
          >
            Add Education
          </button>
        </div>
        <div className="space-y-3">
          {content.education.map((item, index) => (
            <div key={`education-${index}`} className="space-y-2 rounded-xl border border-border bg-background/70 p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  value={item.school}
                  onChange={(event) => updateContent((draft) => void (draft.education[index].school = event.target.value))}
                  placeholder="School"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={item.degree}
                  onChange={(event) => updateContent((draft) => void (draft.education[index].degree = event.target.value))}
                  placeholder="Degree"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={item.start}
                  onChange={(event) => updateContent((draft) => void (draft.education[index].start = event.target.value))}
                  placeholder="Start"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={item.end || ''}
                  onChange={(event) => updateContent((draft) => void (draft.education[index].end = event.target.value))}
                  placeholder="End"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <MediaField
                label="Education Logo"
                value={item.logo || ''}
                onChange={(nextValue) => updateContent((draft) => void (draft.education[index].logo = nextValue))}
                accept="image/*"
                folder="education"
              />
              <button
                type="button"
                onClick={() =>
                  updateContent((draft) => {
                    draft.education.splice(index, 1);
                  })
                }
                className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
              >
                Remove Education
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <h2 className="text-base font-semibold">Skills & Socials</h2>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Skills (comma separated)</span>
          <input
            value={content.skills.join(', ')}
            onChange={(event) =>
              updateContent((draft) => {
                draft.skills = parseCommaList(event.target.value);
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="space-y-2 rounded-xl border border-border bg-background/70 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Social Links</p>
            <button
              type="button"
              onClick={() => updateContent((draft) => void draft.socials.push(defaultSocialLink()))}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
            >
              Add Social
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Order matters: the first Instagram/GitHub/LinkedIn items are used in the bottom dock.
          </p>
          <p className="text-xs text-muted-foreground">Drag rows by the handle to reorder.</p>
          {content.socials.map((item, index) => (
            <div
              key={`social-${index}`}
              draggable
              onDragStart={(event) => {
                setDraggingSocialIndex(index);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setSocialDropTargetIndex(index);
              }}
              onDragLeave={() => {
                setSocialDropTargetIndex((current) => (current === index ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();
                dropSocialAt(index);
                setDraggingSocialIndex(null);
                setSocialDropTargetIndex(null);
              }}
              onDragEnd={() => {
                setDraggingSocialIndex(null);
                setSocialDropTargetIndex(null);
              }}
              className={`rounded-xl border bg-background/70 p-3 transition-colors ${
                socialDropTargetIndex === index ? 'border-primary/70 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </span>
                <p className="truncate text-sm font-semibold text-foreground">{item.name || `Social ${index + 1}`}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-[1fr_2fr_1fr_auto]">
                <input
                  value={item.name}
                  onChange={(event) => updateContent((draft) => void (draft.socials[index].name = event.target.value))}
                  placeholder="Name"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={item.url}
                  onChange={(event) => updateContent((draft) => void (draft.socials[index].url = event.target.value))}
                  placeholder="URL"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <select
                  value={item.icon}
                  onChange={(event) => updateContent((draft) => void (draft.socials[index].icon = event.target.value as SocialIcon))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {SOCIAL_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    updateContent((draft) => {
                      draft.socials.splice(index, 1);
                    })
                  }
                  className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <h2 className="text-base font-semibold">Listening Sessions</h2>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Title</span>
          <input
            value={content.booking.title}
            onChange={(event) => updateContent((draft) => void (draft.booking.title = event.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Intro</span>
          <textarea
            value={content.booking.intro}
            onChange={(event) => updateContent((draft) => void (draft.booking.intro = event.target.value))}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Cal.com Embed URL</span>
          <input
            value={content.booking.embedUrl}
            onChange={(event) => updateContent((draft) => void (draft.booking.embedUrl = event.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="space-y-2 rounded-xl border border-border bg-background/70 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Options</p>
            <button
              type="button"
              onClick={() => updateContent((draft) => void draft.booking.options.push(defaultBookingOption()))}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
            >
              Add Option
            </button>
          </div>
          {content.booking.options.map((option, index) => (
            <div key={`booking-option-${index}`} className="grid gap-2 md:grid-cols-[80px_1fr_2fr_auto]">
              <input
                value={option.emoji}
                onChange={(event) => updateContent((draft) => void (draft.booking.options[index].emoji = event.target.value))}
                placeholder="Emoji"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={option.title}
                onChange={(event) => updateContent((draft) => void (draft.booking.options[index].title = event.target.value))}
                placeholder="Title"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={option.description}
                onChange={(event) => updateContent((draft) => void (draft.booking.options[index].description = event.target.value))}
                placeholder="Description"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  updateContent((draft) => {
                    draft.booking.options.splice(index, 1);
                  })
                }
                className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <h2 className="text-base font-semibold">Contact</h2>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Title</span>
          <input
            value={content.contact.title}
            onChange={(event) => updateContent((draft) => void (draft.contact.title = event.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Body</span>
          <textarea
            value={content.contact.body}
            onChange={(event) => updateContent((draft) => void (draft.contact.body = event.target.value))}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Button Email Target</span>
          <input
            value={content.contact.ctaEmail ?? ''}
            onChange={(event) => updateContent((draft) => void (draft.contact.ctaEmail = event.target.value))}
            placeholder={content.meta.email}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <p className="text-xs text-muted-foreground">Leave blank to use the profile email.</p>
      </section>
      </div>

    </>
  );
}
