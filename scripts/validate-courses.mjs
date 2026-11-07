import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coursesFile = path.resolve(__dirname, '../src/data/courses.json');

console.log('[Validator] Verifying src/data/courses.json...');

if (!fs.existsSync(coursesFile)) {
  console.error('[Error] courses.json does not exist at:', coursesFile);
  process.exit(1);
}

const raw = fs.readFileSync(coursesFile, 'utf8');

// Rule 1: Zero em-dashes (—) or en-dashes (–)
if (/[\u2013\u2014]/.test(raw)) {
  console.error('[Error] Forbidden em-dash (—) or en-dash (–) found in courses.json! Use hyphens, commas, or colons.');
  process.exit(1);
}

let courses;
try {
  courses = JSON.parse(raw);
} catch (err) {
  console.error('[Error] Failed to parse courses.json as valid JSON:', err);
  process.exit(1);
}

if (!Array.isArray(courses) || courses.length === 0) {
  console.error('[Error] courses.json must be a non-empty array.');
  process.exit(1);
}

let hasErrors = false;

courses.forEach((course, index) => {
  const prefix = `[Course #${index} (${course.id || 'unnamed'})]`;

  if (!course.id || typeof course.id !== 'string') {
    console.error(`${prefix} Missing or invalid 'id'.`);
    hasErrors = true;
  }
  if (!course.title || typeof course.title !== 'string') {
    console.error(`${prefix} Missing or invalid 'title'.`);
    hasErrors = true;
  }
  if (!['live', 'in-development', 'planned'].includes(course.status)) {
    console.error(`${prefix} Invalid status: '${course.status}'. Must be live, in-development, or planned.`);
    hasErrors = true;
  }
  if (!course.summary || typeof course.summary !== 'string') {
    console.error(`${prefix} Missing 'summary'.`);
    hasErrors = true;
  } else {
    const wordCount = course.summary.trim().split(/\s+/).length;
    if (wordCount > 25) {
      console.error(`${prefix} Summary exceeds 25 words: (${wordCount} words) "${course.summary}"`);
      hasErrors = true;
    }
  }

  // Live courses must have URL
  if (course.status === 'live') {
    if (!course.url || !course.url.startsWith('http')) {
      console.error(`${prefix} Live course must have a valid HTTP(S) url.`);
      hasErrors = true;
    }
  }

  // Check stats
  if (!Array.isArray(course.stats) || course.stats.length === 0) {
    console.error(`${prefix} Must have at least one stat item.`);
    hasErrors = true;
  } else {
    course.stats.forEach((stat, sIdx) => {
      if (!stat.label || !stat.value || !stat.source) {
        console.error(`${prefix} Stat #${sIdx} is missing label, value, or source proof.`);
        hasErrors = true;
      }
    });
  }
});

if (hasErrors) {
  console.error('[Validator] Validation failed with errors.');
  process.exit(1);
}

console.log(`[Validator] Passed! Validated ${courses.length} courses successfully with zero dash violations and verified sources.`);

