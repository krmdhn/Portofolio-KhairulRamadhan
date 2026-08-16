import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(__dirname, '../portofolio.html'), 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

/**
 * Helper: search for elements matching a CSS selector inside Alpine <template>
 * elements within a given root. Returns the first match found.
 * This is needed because jsdom does not execute Alpine.js, so x-for/x-if
 * templates are never rendered into live DOM nodes.
 */
function queryInsideTemplates(root, selector) {
  // First try the live DOM
  const live = root.querySelector(selector);
  if (live) return live;

  // Then search inside <template> content fragments
  const templates = root.querySelectorAll('template');
  for (const tpl of templates) {
    const found = tpl.content.querySelector(selector);
    if (found) return found;
    // Recurse into nested templates within the fragment
    const nested = queryInsideTemplates(tpl.content, selector);
    if (nested) return nested;
  }
  return null;
}

/**
 * Helper: same as queryInsideTemplates but returns all matches.
 */
function queryAllInsideTemplates(root, selector) {
  const results = [];
  // Live DOM
  root.querySelectorAll(selector).forEach(el => results.push(el));
  // Template content
  root.querySelectorAll('template').forEach(tpl => {
    tpl.content.querySelectorAll(selector).forEach(el => results.push(el));
    // Nested templates
    queryAllInsideTemplates(tpl.content, selector).forEach(el => results.push(el));
  });
  // Deduplicate by reference
  return [...new Set(results)];
}

describe('Featured Projects Section — Unit Tests', () => {

  describe('1. Section placement and structure', () => {
    it('has a #projects section', () => {
      const section = document.querySelector('#projects');
      expect(section).not.toBeNull();
    });

    it('#projects has py-20 class', () => {
      const section = document.querySelector('#projects');
      expect(section.classList.contains('py-20')).toBe(true);
    });

    it('#projects has bg-[#F8FAF9] class', () => {
      const section = document.querySelector('#projects');
      expect(section.getAttribute('class')).toContain('bg-[#F8FAF9]');
    });

    it('#projects is positioned after #skills and before #education', () => {
      const sections = Array.from(document.querySelectorAll('section[id]'));
      const ids = sections.map(s => s.id);
      const skillsIdx = ids.indexOf('skills');
      const projectsIdx = ids.indexOf('projects');
      const educationIdx = ids.indexOf('education');
      expect(projectsIdx).toBeGreaterThan(skillsIdx);
      expect(projectsIdx).toBeLessThan(educationIdx);
    });
  });

  describe('2. Section header design system', () => {
    it('header pill has correct classes', () => {
      const pill = document.querySelector('#projects span.rounded-full');
      expect(pill).not.toBeNull();
      expect(pill.getAttribute('class')).toContain('text-emerald-700');
      expect(pill.getAttribute('class')).toContain('bg-emerald-50');
      expect(pill.getAttribute('class')).toContain('rounded-full');
    });

    it('h2 has correct classes', () => {
      const h2 = document.querySelector('#projects h2');
      expect(h2).not.toBeNull();
      expect(h2.getAttribute('class')).toContain('text-3xl');
      expect(h2.getAttribute('class')).toContain('font-extrabold');
      expect(h2.getAttribute('class')).toContain('text-gray-900');
    });

    it('header wrapper has fade-in-up class', () => {
      const wrapper = document.querySelector('#projects .fade-in-up');
      expect(wrapper).not.toBeNull();
    });
  });

  describe('3. Carousel design system', () => {
    it('carousel wrapper has fade-in-up class', () => {
      // The carousel outer wrapper should also have fade-in-up
      const fadeEls = document.querySelectorAll('#projects .fade-in-up');
      expect(fadeEls.length).toBeGreaterThanOrEqual(2);
    });

    it('card container has card-hover class', () => {
      // The card is inside an Alpine x-for <template>, so query template content
      const projectsSection = document.querySelector('#projects');
      const card = queryInsideTemplates(projectsSection, '.card-hover');
      expect(card).not.toBeNull();
    });

    it('card container has rounded-2xl class', () => {
      const projectsSection = document.querySelector('#projects');
      const card = queryInsideTemplates(projectsSection, '.card-hover');
      expect(card).not.toBeNull();
      expect(card.classList.contains('rounded-2xl')).toBe(true);
    });

    it('card container has shadow-sm class', () => {
      const projectsSection = document.querySelector('#projects');
      const card = queryInsideTemplates(projectsSection, '.card-hover');
      expect(card).not.toBeNull();
      expect(card.classList.contains('shadow-sm')).toBe(true);
    });
  });

  describe('4. Seed data validation', () => {
    // Parse the projects array from the script block
    let projects;
    beforeAll(() => {
      const scripts = document.querySelectorAll('script');
      let scriptContent = '';
      scripts.forEach(s => {
        if (s.textContent.includes('portfolioApp')) {
          scriptContent = s.textContent;
        }
      });

      // Use a bracket-depth scanner to extract the full projects array
      const startIdx = scriptContent.indexOf('projects:');
      if (startIdx !== -1) {
        let depth = 0;
        let inArray = false;
        let arrayStart = -1;
        let arrayEnd = -1;
        for (let i = startIdx; i < scriptContent.length; i++) {
          const ch = scriptContent[i];
          if (ch === '[') {
            if (!inArray) { inArray = true; arrayStart = i; }
            depth++;
          } else if (ch === ']') {
            depth--;
            if (depth === 0 && inArray) {
              arrayEnd = i;
              break;
            }
          }
        }
        if (arrayStart !== -1 && arrayEnd !== -1) {
          const arrayStr = scriptContent.slice(arrayStart, arrayEnd + 1);
          try {
            projects = Function('"use strict"; return ' + arrayStr)();
          } catch (e) {
            projects = null;
          }
        }
      }
    });

    it('projects array has exactly 3 items', () => {
      expect(projects).not.toBeNull();
      expect(projects.length).toBe(3);
    });

    it('each project has required properties', () => {
      projects.forEach(p => {
        expect(typeof p.title).toBe('string');
        expect(typeof p.description).toBe('string');
        expect(typeof p.image).toBe('string');
        expect(Array.isArray(p.tags)).toBe(true);
        expect(typeof p.link).toBe('string');
      });
    });

    it('each project has at least 2 tags', () => {
      projects.forEach(p => {
        expect(p.tags.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('at least one project has a non-empty link', () => {
      const hasLink = projects.some(p => p.link !== '');
      expect(hasLink).toBe(true);
    });

    it('at least one project has an empty link', () => {
      const hasEmpty = projects.some(p => p.link === '');
      expect(hasEmpty).toBe(true);
    });

    it('all project titles are distinct', () => {
      const titles = projects.map(p => p.title);
      const unique = new Set(titles);
      expect(unique.size).toBe(titles.length);
    });
  });

  describe('5. Image onerror handler', () => {
    it('img onerror hides the element', () => {
      // The img element is inside Alpine's x-for <template>, not in the live DOM.
      // We verify the @error / onerror attribute in the template source contains
      // the correct handler, then exercise it manually.
      const projectsSection = document.querySelector('#projects');
      const img = queryInsideTemplates(projectsSection, 'img');
      expect(img).not.toBeNull();

      // Verify the @error Alpine binding is present and contains the hide logic
      const atError = img.getAttribute('@error');
      const onerror = img.getAttribute('onerror');
      const handler = atError || onerror || '';
      expect(handler).toContain("style.display='none'");

      // Manually exercise the handler to confirm it works
      img.style.display = '';
      // Execute: $event.target.style.display = 'none'
      // In the Alpine template, $event.target refers to the img itself
      const fn = new Function('$event', handler);
      fn({ target: img });
      expect(img.style.display).toBe('none');
    });
  });

});
