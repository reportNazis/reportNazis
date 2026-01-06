---
trigger: always_on
---

# Frontend Workspace Rules: Angular 17+ (Tailwind CSS)

## 1. Modern Angular Architecture
- **Standalone Only:** All components, directives, and pipes must be `standalone: true`. No `NgModules`.
- **Control Flow:** Use the new built-in control flow syntax (`@if`, `@for`, `@switch`) instead of `*ngIf`/`*ngFor`.
- **State Management:**
  - Local State: Use **Signals** (`signal()`, `computed()`, `effect()`).
  - Global State: Use a dedicated Service with `WritableSignal`. Avoid complex RxJS state streams unless necessary.

## 2. Styling (Tailwind CSS)
- **Utility-First:** Use Tailwind utility classes directly in the template. Avoid creating custom CSS classes (e.g., `.btn-primary`) unless they are highly reusable components extracted via `@apply`.
- **Dynamic Classes:** Use **`clsx`** or **`tailwind-merge`** for conditional styling. Do not use simple string concatenation or template literals for class names to avoid conflicts.
- **Responsiveness:** Build mobile-first using Tailwind's responsive prefixes (e.g., `flex-col md:flex-row`).
- **No Arbitrary Values:** Avoid "magic numbers" like `w-[357px]`. Stick to the design tokens defined in `tailwind.config.js`.

## 3. Component Structure & Typing
- **Smart vs. Dumb:**
  - **Smart Components:** Handle data fetching, state injection.
  - **Dumb Components (UI):** Receive data via `input()`, emit via `output()`.
- **OnPush:** Always set `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Strict Typing:** No `any`. Define explicit interfaces for all data structures in `models/`.

## 4. Docker & Production
- **Build Process:** Ensure the Dockerfile build stage includes the PostCSS process required to generate the optimized Tailwind output.
- **Runtime Config:** Use a `config.json` or environment injection for API URLs. Do not bundle secrets.
- **Server:** Serve static artifacts via Nginx in the final Docker stage.