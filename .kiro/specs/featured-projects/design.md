# Design Document: Featured Projects Section

## Overview

The Featured Projects section is a pure front-end addition to the existing single-page portfolio (`portofolio.html`). No build tools, bundlers, or backend services are involved — the page already loads Tailwind CSS, Alpine.js, and Font Awesome via CDN. The feature adds:

1. A new `<section id="projects">` placed between the existing Skills and Education sections.
2. Navigation links in both the desktop nav bar and the mobile drawer.
3. An Alpine.js-powered image carousel with arrow controls and dot indicators.
4. Project card components that render cover images (with graceful fallback), title, description, tech tags, and an optional demo link.
5. Three seed project objects added to the existing `portfolioApp()` Alpine function.

All visual styling strictly follows the existing Design System tokens and patterns to maintain a cohesive look.

---

## Architecture

The Portfolio_Page is a single HTML file with no build pipeline. All reactivity is handled by Alpine.js (CDN), already initialized via `x-data="portfolioApp()"` on `<body>`. The `portfolioApp()` function defined in the `<script>` block at the bottom of the file serves as the sole Alpine data/logic root.

The carousel state is added directly to `portfolioApp()` (not as a nested component) to keep the architecture consistent with the existing pattern. This means `currentSlide` and the `projects` array live alongside `mobileOpen` and `activeSection`.

```
portfolioApp()
├── mobileOpen         (existing)
├── activeSection      (existing)
├── currentSlide       (NEW — active slide index, 0-based)
├── projects[]         (NEW — array of project objects)
├── init()             (existing, unchanged)
├── initIntersectionObserver()  (existing, unchanged)
├── initFadeAnimations()        (existing, unchanged)
├── nextSlide()        (NEW)
└── prevSlide()        (NEW)
```

The `activeSection` IntersectionObserver in `initIntersectionObserver()` calls `document.querySelectorAll('section[id]')`, so the new `#projects` section is automatically tracked with no changes required to that observer.

---

## Components and Interfaces

### 1. Projects Section Shell

```html
<section id="projects" class="py-20 bg-[#F8FAF9]" aria-label="Featured projects">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section header -->
    <!-- Carousel -->
  </div>
</section>
```

### 2. Section Header

Follows the identical pill-label + h2 + subtitle pattern used in Experience, Skills, and Education:

```html
<div class="text-center mb-14 fade-in-up">
  <span class="inline-block text-xs font-bold uppercase tracking-widest
               text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
    Projects
  </span>
  <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900">
    Featured Work
  </h2>
  <p class="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
    A selection of personal and professional projects.
  </p>
</div>
```

### 3. Carousel Component

The carousel uses a `overflow-hidden` wrapper and an inner track `div` that is translated horizontally by `currentSlide * 100%` using an inline Alpine `:style` binding. This avoids any external carousel library and keeps the file self-contained.

```
┌──────────────────────────────────────────────┐
│  ←  [ Card 0 ][ Card 1 ][ Card 2 ]  →        │
│       ↑ translated by -currentSlide * 100%    │
└──────────────────────────────────────────────┘
         ○  ●  ○   ← dot indicators
```

**Carousel outer wrapper** (`overflow-hidden`, `relative`):
```html
<div class="relative overflow-hidden rounded-2xl fade-in-up">
  <!-- Track -->
  <div class="flex transition-transform duration-500 ease-in-out"
       :style="`transform: translateX(-${currentSlide * 100}%)`">
    <template x-for="(project, index) in projects" :key="index">
      <!-- Project Card -->
    </template>
  </div>

  <!-- Prev / Next buttons -->
  <!-- Dot indicators -->
</div>
```

### 4. Arrow Buttons

Both buttons are absolutely positioned over the carousel. They use `bg-white/80 backdrop-blur` so they remain legible over any card image.

```html
<!-- Prev -->
<button @click="prevSlide()"
        class="absolute left-3 top-1/2 -translate-y-1/2 z-10
               w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm
               border border-gray-200 shadow-md
               flex items-center justify-center
               text-emerald-900 hover:bg-emerald-900 hover:text-white
               transition-all duration-200"
        aria-label="Previous project">
  <i class="fa-solid fa-chevron-left text-sm"></i>
</button>

<!-- Next -->
<button @click="nextSlide()"
        class="absolute right-3 top-1/2 -translate-y-1/2 z-10
               w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm
               border border-gray-200 shadow-md
               flex items-center justify-center
               text-emerald-900 hover:bg-emerald-900 hover:text-white
               transition-all duration-200"
        aria-label="Next project">
  <i class="fa-solid fa-chevron-right text-sm"></i>
</button>
```

### 5. Dot Indicators

```html
<div class="flex justify-center gap-2 mt-6">
  <template x-for="(project, index) in projects" :key="index">
    <button @click="currentSlide = index"
            class="w-2.5 h-2.5 rounded-full transition-all duration-200"
            :class="currentSlide === index
                      ? 'bg-emerald-900 scale-110'
                      : 'bg-gray-300 hover:bg-emerald-400'"
            :aria-label="`Go to project ${index + 1}`">
    </button>
  </template>
</div>
```

### 6. Project Card

Each card is `min-w-full` so only one fills the carousel track width. The cover image area uses a fixed height with `object-cover` to keep proportions consistent.

```html
<div class="min-w-full px-2 sm:px-4">
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 card-hover overflow-hidden">

    <!-- Cover image -->
    <div class="relative h-52 sm:h-64 bg-gradient-to-br from-emerald-100 to-emerald-50 overflow-hidden">
      <img :src="project.image"
           :alt="project.title + ' cover'"
           class="w-full h-full object-cover"
           @error="$event.target.style.display='none'">
      <!-- Gradient placeholder shown behind the img (always present, revealed on error) -->
    </div>

    <!-- Card body -->
    <div class="p-6 sm:p-8">
      <h3 class="text-lg font-bold text-gray-900 mb-2" x-text="project.title"></h3>
      <p class="text-sm text-gray-600 mb-4 leading-relaxed" x-text="project.description"></p>

      <!-- Tech tags -->
      <div class="flex flex-wrap gap-2 mb-5">
        <template x-for="tag in project.tags" :key="tag">
          <span class="inline-flex items-center bg-emerald-50 text-emerald-800
                       border border-emerald-200 text-xs font-semibold
                       px-3 py-1.5 rounded-full"
                x-text="tag">
          </span>
        </template>
      </div>

      <!-- Demo link (conditional) -->
      <template x-if="project.link">
        <a :href="project.link" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-2 text-sm font-semibold
                  text-emerald-900 hover:text-gold transition-colors duration-200">
          <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
          View Project
        </a>
      </template>

    </div>
  </div>
</div>
```

### 7. Alpine.js Data Additions (portfolioApp)

```javascript
// New data properties (added inside the returned object)
currentSlide: 0,
projects: [
  {
    title: 'Portfolio Website',
    description: 'A responsive single-page portfolio built with Tailwind CSS and Alpine.js, showcasing professional experience, skills, and contact information.',
    image: 'assets/projects/portfolio.png',
    tags: ['HTML', 'Tailwind CSS', 'Alpine.js'],
    link: ''
  },
  {
    title: 'IT Support Dashboard',
    description: 'An internal ticketing and asset-tracking dashboard for IT support operations, featuring device inventory and issue logging.',
    image: 'assets/projects/it-dashboard.png',
    tags: ['HTML', 'CSS', 'JavaScript', 'MySQL'],
    link: '#'
  },
  {
    title: 'Brand Visual Kit',
    description: 'A collection of marketing materials — flyers, social media templates, and digital menus — designed for client brands using Photoshop and Canva.',
    image: 'assets/projects/brand-kit.png',
    tags: ['Adobe Photoshop', 'Canva', 'Figma'],
    link: ''
  }
],

// New methods (added inside the returned object)
nextSlide() {
  this.currentSlide = (this.currentSlide + 1) % this.projects.length;
},
prevSlide() {
  this.currentSlide = (this.currentSlide - 1 + this.projects.length) % this.projects.length;
},
```

### 8. Navigation Link Updates

**Desktop nav** — insert between the Skills and Education anchors:
```html
<a href="#projects" class="nav-link text-sm font-medium text-gray-600 hover:text-emerald-900 pb-1"
   :class="{'active': activeSection==='projects'}">Projects</a>
```

**Mobile drawer** — insert between the Skills and Education mobile links:
```html
<a href="#projects" @click="mobileOpen=false"
   class="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700
          hover:bg-emerald-50 hover:text-emerald-900 transition-colors">
  Projects
</a>
```

---

## Data Models

### Project Object

| Property      | Type     | Required | Description                                              |
|---------------|----------|----------|----------------------------------------------------------|
| `title`       | `string` | Yes      | Display title of the project                             |
| `description` | `string` | Yes      | One-to-two sentence summary of the project               |
| `image`       | `string` | Yes      | Relative path to the cover image (e.g., `assets/...`)   |
| `tags`        | `string[]`| Yes     | Array of technology/tool names (≥ 2 for seed data)       |
| `link`        | `string` | Yes      | URL for a live demo; empty string `""` means no link     |

The `link` field uses an empty string convention (rather than `null`) so Alpine's `x-if="project.link"` falsy check works cleanly without null-safety guards.

### Carousel State (Alpine data)

| Property       | Type     | Initial | Description                                        |
|----------------|----------|---------|----------------------------------------------------|
| `currentSlide` | `number` | `0`     | Zero-based index of the currently visible slide    |
| `projects`     | `array`  | (see §7) | Array of Project objects, length drives dot count |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The carousel logic (`nextSlide`, `prevSlide`, dot binding, card rendering) is pure JavaScript operating on an in-memory data array. This makes it well-suited for property-based testing: the functions are deterministic, the input space (slide indices, project arrays of varying length/content) is large, and 100 iterations will surface off-by-one and boundary bugs that two or three examples would miss.

---

### Property 1: Next-slide wrapping

*For any* carousel with N projects (N ≥ 1) and any starting `currentSlide` index i (0 ≤ i < N), calling `nextSlide()` once must set `currentSlide` to `(i + 1) % N`.

**Validates: Requirements 3.3**

---

### Property 2: Previous-slide wrapping

*For any* carousel with N projects (N ≥ 1) and any starting `currentSlide` index i (0 ≤ i < N), calling `prevSlide()` once must set `currentSlide` to `(i - 1 + N) % N`.

**Validates: Requirements 3.4**

---

### Property 3: Dot-to-slide synchronization

*For any* valid `currentSlide` index i and projects array of length N, the dot at index i must receive the active CSS classes (`bg-emerald-900 scale-110`) and every other dot must receive only inactive classes (`bg-gray-300`), with no active class appearing on a dot whose index differs from `currentSlide`.

**Validates: Requirements 3.5, 3.6**

---

### Property 4: Card content completeness

*For any* array of project objects, the rendered HTML for each card must contain: (a) an `<img>` element whose `src` equals `project.image`; (b) a heading element whose text content equals `project.title`; (c) a paragraph whose text content equals `project.description`; (d) exactly `project.tags.length` badge elements, one per tag string.

**Validates: Requirements 4.1, 4.3, 4.4, 4.5**

---

### Property 5: Demo link conditionality

*For any* project object, the rendered card contains a demo-link `<a>` element with `href === project.link` if and only if `project.link` is a non-empty string; when `project.link` is empty or absent, no such anchor element is rendered.

**Validates: Requirements 4.6, 4.7**

---

## Error Handling

### Image Load Failure

When a project's cover image path is invalid or the file is missing, the `<img>` element fires an `onerror` event. The handler sets `$event.target.style.display = 'none'`, hiding the broken image. The parent `div` already has a CSS gradient background (`bg-gradient-to-br from-emerald-100 to-emerald-50`) that is revealed automatically, preserving the card's fixed-height layout.

### Empty Projects Array

If `projects` is somehow empty (future extension), the carousel track renders no cards, the dot row renders no dots, and the arrow buttons are still present but effectively no-ops (modulo 0 is NaN in JS, so the next/prevSlide methods should guard: `if (!this.projects.length) return`). This guard should be added to both methods.

### Alpine Initialization Failure

If Alpine fails to load (CDN unavailable), all `x-*` attributes are ignored by the browser. The static HTML structure (section shell, header text) still renders; the carousel track will show all cards stacked as full-width blocks. This is acceptable graceful degradation for a portfolio.

---

## Testing Strategy

This feature is a front-end-only addition to a static HTML file. There is no backend, no build step, and no test runner configured in the project. The recommended approach uses **Vitest** (with `jsdom` environment) since it is lightweight, zero-config for vanilla JS, and supports both unit tests and property-based tests via the `fast-check` library.

### Property-Based Testing Library

**Library**: `fast-check` (npm: `fast-check`)
**Runner**: `vitest --run` (single execution, no watch mode)
**Minimum iterations per property**: 100 (fast-check default is 100; configure via `fc.assert(..., { numRuns: 100 })`)

Each property test must reference its design document property using this tag comment:

```
// Feature: featured-projects, Property N: <property text>
```

### Test Types

**Property tests** (using fast-check) validate the carousel logic in isolation:
- Extract `nextSlide`, `prevSlide`, and the dot-state derivation logic into pure functions testable without a DOM.
- Generate: random `projects` array lengths (1–20), random starting `currentSlide` values.
- Assert the modular arithmetic and rendering invariants described in Properties 1–5.

**Unit/example tests** (using vitest directly) validate:
- Seed data shape: 3 projects, required properties present, distinct titles, ≥ 2 tags each, at least one with a non-empty link and one with an empty link.
- DOM structure: `#projects` section exists between `#skills` and `#education` in the parsed HTML.
- CSS class presence: section header pill, h2, `py-20`, `bg-[#F8FAF9]`, `card-hover`, `rounded-2xl` on the card wrapper.
- Nav link presence: both desktop and mobile nav contain `href="#projects"` in the correct sibling order.
- Image error handler: triggering `onerror` hides the `<img>` element.
- Alpine active-link binding: `activeSection === 'projects'` applies the `active` class to the nav link.

**No integration tests** are required — there are no external services, APIs, or databases involved.

### Test File Location

```
tests/
  featured-projects.unit.test.js      — example/unit tests (DOM, seed data, CSS)
  featured-projects.property.test.js  — fast-check property tests (carousel logic)
```

### Running Tests

```bash
npx vitest --run
```

> Note: `vitest --run` executes tests once and exits, suitable for CI and one-shot verification.
