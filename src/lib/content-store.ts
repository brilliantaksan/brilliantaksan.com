import { constants, promises as fs } from 'fs';
import path from 'path';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { SiteContent } from '@/lib/types';

const SITE_CONTENT_RELATIVE_PATH = path.join('content', 'site.json');

interface GithubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

function getSiteContentAbsolutePath() {
  return path.join(process.cwd(), SITE_CONTENT_RELATIVE_PATH);
}

function getSupabaseContentConfig() {
  const bucket = process.env.SUPABASE_CONTENT_BUCKET ?? process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? 'media';
  const objectPath = process.env.SUPABASE_CONTENT_PATH ?? SITE_CONTENT_RELATIVE_PATH;
  return { bucket, objectPath };
}

function hasSupabaseServerConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

function isReadonlyFileSystemError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    'code' in error &&
    (error.code === 'EROFS' || error.code === 'EACCES' || error.code === 'EPERM')
  );
}

async function isLocalContentWritable() {
  try {
    await fs.access(getSiteContentAbsolutePath(), constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function getGithubRepoConfig() {
  const repo = process.env.GITHUB_REPO ?? 'brilliantaksan/brilliantaksan.com';
  const branch = process.env.GITHUB_BRANCH ?? 'main';
  const token = process.env.GITHUB_CONTENT_TOKEN;

  return { repo, branch, token };
}

function parseRepo(repo: string) {
  const [owner, name] = repo.split('/');
  if (!owner || !name) {
    throw new Error('Invalid GITHUB_REPO. Expected format: owner/repo');
  }
  return { owner, name };
}

function decodeBase64Json(content: string) {
  const normalized = content.replace(/\n/g, '');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

async function fetchGithubFile() {
  const { repo, branch, token } = getGithubRepoConfig();
  if (!token) {
    throw new Error('Missing GITHUB_CONTENT_TOKEN.');
  }

  const { owner, name } = parseRepo(repo);
  const apiUrl = `https://api.github.com/repos/${owner}/${name}/contents/${SITE_CONTENT_RELATIVE_PATH}?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub content fetch failed (${response.status}): ${details}`);
  }

  const data = (await response.json()) as GithubFileResponse;
  if (data.encoding !== 'base64') {
    throw new Error(`Unsupported GitHub file encoding: ${data.encoding}`);
  }

  return { sha: data.sha, rawJson: decodeBase64Json(data.content) };
}

async function readSiteContentFromFile() {
  const filePath = getSiteContentAbsolutePath();
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as SiteContent;
}

async function readSiteContentFromSupabase() {
  if (!hasSupabaseServerConfig()) {
    return null;
  }

  const { bucket, objectPath } = getSupabaseContentConfig();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes('not found') || message.includes('404')) {
      return null;
    }
    throw new Error(`Supabase content fetch failed: ${error.message}`);
  }

  const raw = await data.text();
  return JSON.parse(raw) as SiteContent;
}

export async function readSiteContent(): Promise<SiteContent> {
  const { token } = getGithubRepoConfig();

  if (token) {
    const { rawJson } = await fetchGithubFile();
    return JSON.parse(rawJson) as SiteContent;
  }

  if (await isLocalContentWritable()) {
    return readSiteContentFromFile();
  }

  const supabaseContent = await readSiteContentFromSupabase();
  if (supabaseContent) {
    return supabaseContent;
  }

  return readSiteContentFromFile();
}

async function writeSiteContentToGithub(content: SiteContent) {
  const { repo, branch, token } = getGithubRepoConfig();
  if (!token) {
    throw new Error('Missing GITHUB_CONTENT_TOKEN.');
  }

  const { owner, name } = parseRepo(repo);
  const { sha } = await fetchGithubFile();
  const rawJson = `${JSON.stringify(content, null, 2)}\n`;
  const encoded = Buffer.from(rawJson, 'utf8').toString('base64');
  const apiUrl = `https://api.github.com/repos/${owner}/${name}/contents/${SITE_CONTENT_RELATIVE_PATH}`;

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update homepage content from admin studio',
      content: encoded,
      sha,
      branch
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub content update failed (${response.status}): ${details}`);
  }
}

async function writeSiteContentToFile(content: SiteContent) {
  const filePath = getSiteContentAbsolutePath();
  await fs.writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
}

async function writeSiteContentToSupabase(content: SiteContent) {
  if (!hasSupabaseServerConfig()) {
    throw new Error('Missing Supabase server environment variables.');
  }

  const { bucket, objectPath } = getSupabaseContentConfig();
  const rawJson = `${JSON.stringify(content, null, 2)}\n`;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, Buffer.from(rawJson, 'utf8'), {
    contentType: 'application/json',
    cacheControl: '0',
    upsert: true
  });

  if (error) {
    throw new Error(`Supabase content update failed: ${error.message}`);
  }
}

export async function writeSiteContent(content: SiteContent) {
  const { token } = getGithubRepoConfig();
  if (token) {
    await writeSiteContentToGithub(content);
    return;
  }

  try {
    await writeSiteContentToFile(content);
  } catch (fileError) {
    if (!isReadonlyFileSystemError(fileError)) {
      throw fileError;
    }

    if (!hasSupabaseServerConfig()) {
      throw new Error(
        'Server filesystem is read-only. Set GITHUB_CONTENT_TOKEN or configure Supabase server environment variables to persist admin changes.'
      );
    }

    await writeSiteContentToSupabase(content);
  }
}
