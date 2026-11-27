import resources from '../data/resources.json';
import paths from '../data/paths.json';
import certifications from '../data/certifications.json';
import roadmaps from '../data/roadmaps.json';

export type Resource = (typeof resources)[number];
export type Path = (typeof paths)[number];
export type Cert = (typeof certifications)[number];
export type Roadmap = (typeof roadmaps)[number];

export const LAST_CHECKED = '27 Nov 2026';
export const LAST_CHECKED_ISO = '2026-11-27';

export const TYPES: Record<string, { label: string; plural: string; icon: string; blurb: string }> = {
  course: { label: 'Course', plural: 'Courses', icon: 'book-open', blurb: 'Structured, mostly free courses worth finishing.' },
  practice: { label: 'Practice', plural: 'Practice platforms', icon: 'dumbbell', blurb: 'Where you write code, solve problems and hack labs.' },
  docs: { label: 'Docs', plural: 'Docs and guides', icon: 'file-text', blurb: 'Official docs and written guides to keep open while you build.' },
  video: { label: 'YouTube', plural: 'YouTube channels', icon: 'circle-play', blurb: 'Channels that teach well, including Hindi creators.' },
  roadmap: { label: 'Roadmap', plural: 'Roadmaps and sheets', icon: 'map', blurb: 'Checklists and problem sheets that keep you on track.' },
  tool: { label: 'Tool', plural: 'Tools', icon: 'wrench', blurb: 'Software and free tiers to install on day one.' },
  community: { label: 'Community', plural: 'Communities', icon: 'users', blurb: 'Places to ask questions, meet developers and find work.' },
  program: { label: 'Program', plural: 'Programs and hackathons', icon: 'git-pull-request', blurb: 'Open source programs, hackathons and student perks.' },
  newsletter: { label: 'Newsletter', plural: 'Newsletters', icon: 'mail', blurb: 'A few emails worth reading to stay current.' },
  podcast: { label: 'Podcast', plural: 'Podcasts', icon: 'mic', blurb: 'For commutes and chai breaks.' },
  jobs: { label: 'Jobs', plural: 'Job boards', icon: 'briefcase', blurb: 'Where to find internships and jobs, India first.' },
  book: { label: 'Book', plural: 'Books', icon: 'book', blurb: 'A few books that are worth the time.' },
};

export const TYPE_ORDER = ['course', 'practice', 'video', 'docs', 'roadmap', 'tool', 'community', 'program', 'newsletter', 'podcast', 'jobs', 'book'];

export const TRACKS: Record<string, string> = {
  core: 'Everyone',
  frontend: 'Frontend',
  backend: 'Backend',
  mobile: 'Mobile',
  cloud: 'Cloud and DevOps',
  ai: 'AI and ML',
  data: 'Data',
  dsa: 'Placements and DSA',
  security: 'Security',
};

export const COST: Record<string, string> = { free: 'Free', freemium: 'Free tier', paid: 'Paid' };
export const LEVEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', all: 'All levels' };
export const LANG: Record<string, string> = { en: 'English', hi: 'Hindi', 'hi-en': 'Hindi and English' };

export const VERDICT: Record<string, { label: string; tone: string; text: string }> = {
  worth: { label: 'Worth it', tone: 'free', text: 'Recognised by employers and proves real skill.' },
  good: { label: 'Good to have', tone: 'neutral', text: 'Helps a little. Your projects matter more.' },
  only: { label: 'Only if needed', tone: 'paid', text: 'Take it only if a job or your goal asks for it.' },
};

const byId = new Map(resources.map((r) => [r.id, r]));
export const res = (id: string) => {
  const r = byId.get(id);
  if (!r) throw new Error(`Unknown resource id: ${id}`);
  return r;
};
const certById = new Map(certifications.map((c) => [c.id, c]));
export const cert = (id: string) => {
  const c = certById.get(id);
  if (!c) throw new Error(`Unknown certification id: ${id}`);
  return c;
};

export const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');

export { resources, paths, certifications, roadmaps };
export const roadmapsFor = (pathId: string) => roadmaps.filter((r) => r.related === pathId);
