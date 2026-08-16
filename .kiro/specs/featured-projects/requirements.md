# Requirements Document

## Introduction

This feature adds a **Featured Projects** section to Khairul Ramadhan's single-page portfolio (`portofolio.html`). The section is inserted between the existing Skills and Education sections and showcases personal/professional projects through an Alpine.js-powered image carousel. Each slide is a project card displaying a cover image, title, description, technology tags, and an optional demo link. Navigation links for the new section are added to both the desktop nav bar and the mobile drawer, consistent with all existing links. The section follows the established design system: emerald/gold palette, `rounded-2xl` cards, `card-hover` transitions, `fade-in-up` scroll animations, and the pill-label + h2 + subtitle section header pattern.

---

## Glossary

- **Portfolio_Page**: The single HTML file `portofolio.html` that constitutes the entire portfolio site.
- **Projects_Section**: The new `<section id="projects">` element inserted between the Skills section closing tag and the Education section opening tag.
- **Carousel**: The Alpine.js reactive component inside the Projects_Section that cycles through project slides.
- **Project_Card**: A single slide within the Carousel, containing a cover image, title, description, tech tags, and an optional demo link.
- **Nav_Bar**: The sticky glassmorphism navigation bar at the top of the Portfolio_Page containing desktop nav links.
- **Mobile_Drawer**: The collapsible menu revealed on small viewports via the hamburger button, driven by Alpine's `mobileOpen` state.
- **activeSection**: The Alpine.js data property that tracks the currently visible section ID and drives active-link highlighting.
- **Tech_Tag**: A badge element styled identically to the skill badges in the Skills section, displaying a technology name used in a project.
- **Design_System**: The shared set of Tailwind CSS utility classes, custom CSS rules, and color tokens already established in the Portfolio_Page (emerald/gold palette, `rounded-2xl`, `card-hover`, `fade-in-up`, `navbar-glass`, section header pattern).
- **Placeholder_Image**: A project cover image whose `src` attribute points to a relative path that may not exist; the element uses an `onerror` handler to fall back to a CSS gradient placeholder.

---

## Requirements

### Requirement 1: Projects Section Placement

**User Story:** As a portfolio visitor, I want to see a dedicated Projects section between Skills and Education, so that I can review Khairul's project work in a logical content flow.

#### Acceptance Criteria

1. THE Portfolio_Page SHALL contain a `<section>` element with `id="projects"` inserted immediately after the closing `</section>` tag of the Skills section and immediately before the opening `<section>` tag of the Education section.
2. THE Projects_Section SHALL use `bg-[#F8FAF9]` as its background color to alternate visually with the adjacent Skills section (which uses `bg-white`) and the adjacent Education section (which also uses `bg-[#F8FAF9]`).
3. THE Projects_Section SHALL include a section header composed of a pill label, an `<h2>` heading, and a subtitle paragraph, matching the header pattern used in the Experience, Skills, and Education sections.
4. THE Projects_Section SHALL apply `py-20` vertical padding to match the spacing of all other content sections on the Portfolio_Page.

---

### Requirement 2: Navigation Integration

**User Story:** As a portfolio visitor, I want a "Projects" navigation link in both the desktop nav bar and the mobile drawer, so that I can jump directly to the Projects section from anywhere on the page.

#### Acceptance Criteria

1. THE Nav_Bar SHALL contain an anchor element with `href="#projects"` and visible text "Projects", inserted between the existing "Skills" link and the existing "Education" link, maintaining the left-to-right order: About → Experience → Skills → **Projects** → Education → Contact.
2. THE Mobile_Drawer SHALL contain an anchor element with `href="#projects"` and visible text "Projects", inserted between the existing "Skills" link and the existing "Education" link, maintaining the same order as the desktop nav.
3. WHEN the Projects nav link in the Mobile_Drawer is clicked, THE Mobile_Drawer SHALL close by setting `mobileOpen` to `false`, consistent with the behavior of all other mobile nav links.
4. THE Projects nav link in the Nav_Bar SHALL apply the `active` CSS class and the `nav-link` animated-underline style WHEN `activeSection` equals `"projects"`, consistent with all other desktop nav links.
5. THE Projects nav link in the Nav_Bar SHALL use the same Tailwind utility classes as the other desktop nav links: `nav-link text-sm font-medium text-gray-600 hover:text-emerald-900 pb-1`.
6. THE Projects nav link in the Mobile_Drawer SHALL use the same Tailwind utility classes as the other mobile nav links: `block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors`.

---

### Requirement 3: Carousel Behavior

**User Story:** As a portfolio visitor, I want to browse projects using a carousel with arrow controls and dot indicators, so that I can navigate between project cards smoothly without the page reloading.

#### Acceptance Criteria

1. THE Carousel SHALL be implemented as an Alpine.js reactive component with a `currentSlide` (or equivalent) data property tracking the index of the active slide (zero-based).
2. THE Carousel SHALL display exactly one Project_Card at a time in the visible viewport area of the carousel track.
3. WHEN the visitor clicks the Next arrow button, THE Carousel SHALL advance `currentSlide` to the next index, wrapping from the last slide index back to `0`.
4. WHEN the visitor clicks the Previous arrow button, THE Carousel SHALL retreat `currentSlide` to the previous index, wrapping from `0` back to the last slide index.
5. THE Carousel SHALL render one dot indicator per project in the projects data array; the dot corresponding to `currentSlide` SHALL be visually distinguished (filled/opaque) from inactive dots (unfilled/semi-transparent).
6. WHEN a dot indicator is clicked, THE Carousel SHALL set `currentSlide` to the index of that dot.
7. THE Carousel SHALL use a CSS transition to produce a smooth horizontal slide animation when `currentSlide` changes, achieved via a `transform: translateX(...)` and `transition` property on the carousel track element.

---

### Requirement 4: Project Card Content

**User Story:** As a portfolio visitor, I want each project card to show a cover image, title, description, tech tags, and an optional demo link, so that I can quickly assess what a project is about and how to access it.

#### Acceptance Criteria

1. EACH Project_Card SHALL display a cover image element whose `src` is set to the project's `image` data property (a relative file path).
2. IF the cover image fails to load, THEN THE Project_Card SHALL replace the broken image with a visible CSS gradient placeholder generated via an inline `onerror` handler, so that the card layout is preserved.
3. EACH Project_Card SHALL display the project's `title` in a heading element styled with `font-bold text-gray-900`.
4. EACH Project_Card SHALL display the project's `description` as a short paragraph styled with `text-gray-600 text-sm`.
5. EACH Project_Card SHALL render one Tech_Tag element per entry in the project's `tags` array; each Tech_Tag SHALL match the emerald badge style used in the Skills section: `bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full`.
6. WHERE a project's `link` property is a non-empty string, THE Project_Card SHALL render an anchor element that opens the link in a new browser tab (`target="_blank"`) with `rel="noopener noreferrer"` for security.
7. WHERE a project's `link` property is absent or empty, THE Project_Card SHALL NOT render any demo link anchor element.

---

### Requirement 5: Design System Compliance

**User Story:** As a portfolio owner, I want the Projects section to look and feel consistent with every other section on the page, so that the portfolio presents a unified visual identity.

#### Acceptance Criteria

1. THE Projects_Section SHALL apply the `fade-in-up` CSS class to animatable child elements so that the existing `IntersectionObserver`-based scroll animation triggers correctly when the section enters the viewport.
2. THE Project_Card container element SHALL apply the `card-hover` CSS class to produce the `translateY(-4px)` lift and shadow effect on mouse hover, consistent with cards in the Experience and Education sections.
3. THE Project_Card container element SHALL use `rounded-2xl` border radius and `shadow-sm border border-gray-100` to match the card style of the Experience and Education sections.
4. THE section header pill label SHALL use the established pattern: `inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3`.
5. THE section header `<h2>` SHALL use `text-3xl sm:text-4xl font-extrabold text-gray-900` to match headings in all other sections.
6. THE Carousel next/previous arrow buttons SHALL use the emerald color token (e.g., `bg-emerald-900 text-white` or `border-emerald-900 text-emerald-900`) and SHALL apply a hover transition consistent with the Design_System.

---

### Requirement 6: Seed Project Data

**User Story:** As a portfolio owner, I want three placeholder projects pre-loaded in the Alpine component, so that the carousel is immediately functional without requiring additional data entry.

#### Acceptance Criteria

1. THE `portfolioApp` Alpine.js function SHALL include a `projects` array containing exactly 3 project objects as initial data.
2. EACH project object SHALL contain at minimum the following properties: `title` (string), `description` (string), `image` (string — relative path), `tags` (array of strings), and `link` (string — may be empty).
3. THE 3 seed projects SHALL have distinct titles and non-empty `tags` arrays with at least 2 tags each, so that the Tech_Tag rendering is exercised for all cards.
4. AT LEAST ONE seed project SHALL have a non-empty `link` value so that the optional demo link rendering is exercised out of the box.
5. AT LEAST ONE seed project SHALL have an empty `link` value so that the conditional rendering of the demo link is verified by visual inspection.
