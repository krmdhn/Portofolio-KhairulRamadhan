# Implementation Plan: Featured Projects Section

## Overview

This plan implements the Featured Projects section by making targeted additions to `portofolio.html` and wiring the carousel logic into the existing `portfolioApp()` Alpine function. Tasks proceed from data layer → Alpine logic → HTML markup → navigation, finishing with the test suite. Each task is self-contained and builds directly on the previous one.

---

## Tasks

- [x] 1. Add project data and carousel state to `portfolioApp()`
  - In `portofolio.html`, open the `portfolioApp()` function in the `<script>` block at the bottom of the file.
  - Add a `currentSlide: 0` property to the returned object.
  - Add a `projects` array with exactly 3 seed project objects. Each object must have: `title` (string), `description` (string), `image` (string — relative path), `tags` (string[] with ≥ 2 items), and `link` (string — empty string for projects with no demo link).
  - Seed titles: `"Portfolio Website"`, `"IT Support Dashboard"`, `"Brand Visual Kit"` (or equivalent distinct titles).
  - At least one project must have a non-empty `link`; at least one must have an empty `link: ""`.
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2. Implement carousel navigation methods in `portfolioApp()`
  - Still inside `portfolioApp()`, add a `nextSlide()` method that sets `this.currentSlide = (this.currentSlide + 1) % this.projects.length` — with an early-return guard if `this.projects.length === 0`.
  - Add a `prevSlide()` method that sets `this.currentSlide = (this.currentSlide - 1 + this.projects.length) % this.projects.length` — with the same guard.
  - _Requirements: 3.3, 3.4_

  - [ ]* 2.1 Write property tests for next/prev slide wrapping
    - Set up `vitest` and `fast-check` as dev dependencies (`npm install --save-dev vitest fast-check jsdom`).
    - Create `tests/featured-projects.property.test.js`.
    - Extract the nextSlide/prevSlide modular-arithmetic logic into a pure helper (or import and call via a mock Alpine-state object) so it can be tested without a DOM.
    - **Property 1: Next-slide wrapping** — `fc.assert(fc.property(fc.integer({min:1,max:20}), fc.integer({min:0}), (n, i) => { const start = i % n; /* ... */ }))`
    - **Property 2: Previous-slide wrapping**
    - Tag format: `// Feature: featured-projects, Property 1: Next-slide wrapping`
    - Minimum 100 runs per property (`numRuns: 100`).
    - _Validates: Requirements 3.3, 3.4_

- [x] 3. Add the Projects section HTML shell and section header
  - In `portofolio.html`, locate the closing `</section>` tag of the Skills section (the one ending `<!-- END SKILLS -->`).
  - Immediately after that closing tag, insert a new `<section id="projects" class="py-20 bg-[#F8FAF9]" aria-label="Featured projects">`.
  - Inside, add the `max-w-7xl` container `div` and the section header: pill label (`text-emerald-700 bg-emerald-50 ... rounded-full`), `<h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">Featured Work</h2>`, and a subtitle paragraph.
  - Apply `fade-in-up` to the header wrapper `div`.
  - Close the section before the existing Education `<section>` opening tag.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.4, 5.5_

- [x] 4. Build the carousel track and project card template
  - Inside the Projects section container, after the section header, add the carousel outer wrapper: `<div class="relative overflow-hidden rounded-2xl fade-in-up">`.
  - Inside the wrapper, add the track `<div class="flex transition-transform duration-500 ease-in-out" :style="\`transform: translateX(-\${currentSlide * 100}%)\`">`.
  - Inside the track, add `<template x-for="(project, index) in projects" :key="index">` with the Project Card structure inside:
    - Outer card: `<div class="min-w-full px-2 sm:px-4"><div class="bg-white rounded-2xl shadow-sm border border-gray-100 card-hover overflow-hidden">`.
    - Image area: `<div class="relative h-52 sm:h-64 bg-gradient-to-br from-emerald-100 to-emerald-50 overflow-hidden">` containing `<img :src="project.image" :alt="project.title + ' cover'" class="w-full h-full object-cover" @error="$event.target.style.display='none'">`.
    - Card body: heading (`x-text="project.title"`), description paragraph (`x-text="project.description"`), tech tags loop (`<template x-for="tag in project.tags" :key="tag">`), conditional demo link (`<template x-if="project.link">`).
    - Tech tag badge classes: `bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full`.
    - Demo link: `target="_blank" rel="noopener noreferrer"`, `fa-solid fa-arrow-up-right-from-square` icon.
  - _Requirements: 3.2, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.2, 5.3_

  - [ ]* 4.1 Write property tests for card content and link conditionality
    - In `tests/featured-projects.property.test.js`, add:
    - **Property 4: Card content completeness** — generate random project arrays and verify each rendered card contains image src, title text, description text, and correct tag count. Use `jsdom` to parse the Alpine `x-for` output or test the rendering logic as a pure template function.
    - **Property 5: Demo link conditionality** — generate projects with randomly empty/non-empty `link` strings and verify anchor presence matches `project.link !== ""`.
    - Tag format: `// Feature: featured-projects, Property 4: Card content completeness`
    - _Validates: Requirements 4.1, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Add Prev/Next arrow buttons and dot indicators to the carousel
  - Still inside the carousel outer `div` (sibling of the track), add the Previous arrow `<button @click="prevSlide()" aria-label="Previous project">` with absolute positioning classes: `absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center text-emerald-900 hover:bg-emerald-900 hover:text-white transition-all duration-200` and a `fa-solid fa-chevron-left` icon.
  - Add the Next arrow `<button @click="nextSlide()" aria-label="Next project">` with the same classes but `right-3` instead of `left-3` and `fa-solid fa-chevron-right`.
  - After the carousel outer wrapper, add the dot row: `<div class="flex justify-center gap-2 mt-6">` containing `<template x-for="(project, index) in projects" :key="index">` with a `<button @click="currentSlide = index" :class="currentSlide === index ? 'bg-emerald-900 scale-110' : 'bg-gray-300 hover:bg-emerald-400'" class="w-2.5 h-2.5 rounded-full transition-all duration-200">`.
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 5.6_

  - [ ]* 5.1 Write property test for dot-to-slide synchronization
    - In `tests/featured-projects.property.test.js`, add:
    - **Property 3: Dot-to-slide synchronization** — for any projects array length N and any valid currentSlide index, the rendered dot row must have exactly one button with the active class (`bg-emerald-900`) at the matching index and inactive classes (`bg-gray-300`) on all others.
    - Tag format: `// Feature: featured-projects, Property 3: Dot-to-slide synchronization`
    - _Validates: Requirements 3.5, 3.6_

- [x] 6. Checkpoint — verify carousel functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Add Projects navigation links to the Nav_Bar and Mobile_Drawer
  - In the desktop nav `<div class="hidden md:flex items-center gap-7">`, insert the new link between the Skills `<a>` and the Education `<a>`:
    ```html
    <a href="#projects" class="nav-link text-sm font-medium text-gray-600 hover:text-emerald-900 pb-1"
       :class="{'active': activeSection==='projects'}">Projects</a>
    ```
  - In the Mobile_Drawer `<div ... class="md:hidden ...">`, insert the new link between the Skills and Education mobile anchors:
    ```html
    <a href="#projects" @click="mobileOpen=false"
       class="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700
              hover:bg-emerald-50 hover:text-emerald-900 transition-colors">
      Projects
    </a>
    ```
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 7.1 Write unit tests for navigation links
    - Create `tests/featured-projects.unit.test.js`.
    - Parse the HTML file with `jsdom`.
    - Verify the desktop nav contains `a[href="#projects"]` with correct classes and that its DOM position is between the Skills link and the Education link.
    - Verify the mobile drawer contains `a[href="#projects"]` with correct classes and correct sibling order.
    - Verify the `@click="mobileOpen=false"` attribute is present on the mobile link.
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

- [x] 8. Write unit tests for DOM structure, design system compliance, and seed data
  - In `tests/featured-projects.unit.test.js`, add tests for:
    - `#projects` section exists, has classes `py-20 bg-[#F8FAF9]`, is positioned after `#skills` and before `#education` in the DOM.
    - Section header pill has correct classes; `<h2>` has correct classes.
    - `card-hover`, `rounded-2xl`, `shadow-sm border border-gray-100` present on the card container.
    - `fade-in-up` present on the section header and carousel wrapper.
    - Seed data validation: Alpine script block contains a `projects` array with 3 items, each having `title`, `description`, `image`, `tags` (≥ 2 items), and `link` properties; at least one with non-empty `link`; titles are distinct.
    - Image `onerror` handler: triggering the handler sets `display: none` on the `<img>` element.
  - _Requirements: 1.1–1.4, 5.1–5.5, 6.1–6.5_

- [x] 9. Final checkpoint — ensure all tests pass
  - Run `npx vitest --run` and confirm zero failures.
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references specific requirements for traceability.
- Checkpoints at tasks 6 and 9 ensure incremental validation.
- Property tests (fast-check) validate universal carousel correctness; unit tests validate concrete DOM structure and seed data.
- The test setup (`vitest`, `fast-check`, `jsdom`) only requires a `package.json` in the project root — no bundler or build pipeline changes are needed for the portfolio itself.
