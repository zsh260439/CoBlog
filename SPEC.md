# DevBlog - Particle Coder Blog System

## 1. Concept & Vision

A distinctive full-stack blog platform that merges **programmer identity** with **cinematic storytelling**. The aesthetic is refined and subtle — not cyberpunk neon, but sophisticated coding environment with muted colors, clean typography, and gentle particle animations. It feels like code made visible: precise, minimal, and intentional.

The experience prioritizes **readability and professionalism** over decoration. This is a landing/showcase page — the actual functional blog will be developed separately.

---

## 2. Design Language

### Aesthetic Direction
**"Subtle Sci-Fi Coding"** — Clean white backgrounds with muted accent colors (soft cyan, gentle teal), monospace typography, geometric minimalism, and ambient particle effects that never distract from content.

### Color Palette
```
--primary:        #1a1d23   /* Sophisticated dark charcoal */
--secondary:      #24282e   /* Slightly lighter surface */
--tertiary:       #2d323a   /* Card backgrounds */

--accent-muted:   #6b7280   /* Muted gray */
--accent-cyan:    #5fa8d3   /* Soft cyan accent */
--accent-teal:    #62c370   /* Gentle teal/green */
--accent-warm:     #c4a35a   /* Warm accent (minimal use) */

--bg-primary:     #fafbfc   /* Main background */
--bg-secondary:   #f3f4f6   /* Section backgrounds */
--bg-card:        #ffffff   /* Card backgrounds */

--text-primary:   #1a1d23   /* Main text */
--text-secondary: #6b7280   /* Secondary text */
--text-muted:     #9ca3af   /* Muted text */

--border-light:   rgba(0,0,0,0.06)    /* Subtle borders */
--border-medium:  rgba(0,0,0,0.12)   /* Medium borders */
```

### Typography
- **Headlines**: `JetBrains Mono` (Bold 700) — technical, refined
- **Body**: `Inter` (Regular 400, Medium 500) — clean, readable
- **Code/Mono**: `JetBrains Mono` (Regular 400) — consistent coding feel
- **Scale**: 10/12/14/16/18/20/24/30/36/48/60/72px

### Spatial System
- Base unit: 4px
- Spacing scale: 0, 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Border radius: 0 (minimal) or 2px (default) — no large radii
- Content max-width: 1200px

### Motion Philosophy
- **Entrance**: Fade + translateY (12-20px), 400-500ms, ease-out
- **Hover**: Subtle translate, opacity changes, 200-300ms
- **Scroll triggers**: Intersection Observer with 0.5 threshold
- **Particle animation**: Very slow, ambient (0.3-0.5 speed), low opacity
- **Accessibility**: Full `prefers-reduced-motion` support

### Visual Assets
- **Icons**: Element Plus icons (consistent style)
- **Decorative**: CSS geometric shapes, subtle grid patterns, particle canvas
- **No**: AI-style gradients, blob shapes, robot imagery, excessive glow, bright neon colors

---

## 3. Layout & Structure

### Page Architecture

#### Landing Page (Current)
1. **Hero Section** (85vh)
   - Subtle particle canvas background (low density ~50 particles, slow movement)
   - Large typographic logo "DEVBLOG."
   - Tagline emphasizing coder identity
   - Scroll indicator

2. **Scrollytelling Narrative** (variable height)
   - Split layout on desktop: 50% left (scrolling content) / 50% right (sticky visual)
   - 3 narrative chapters
   - Each chapter: chapter number, title, subtitle, body text
   - Right side: sticky geometric visual with transitions

3. **About Section**
   - Brief introduction
   - Social links (GitHub, Twitter, Email)

4. **Footer**
   - Build version
   - Social links
   - Copyright

#### Blog Post Page (Future)
1. **Header**: Title, metadata, cover image
2. **Content**: Markdown rendered with syntax highlighting
3. **Navigation**: Back to archive link

### Responsive Strategy
- Mobile (< 768px): Single column, stacked layout
- Tablet (768-1024px): Adjusted spacing, smaller typography
- Desktop (> 1024px): Full split-screen scrollytelling

---

## 4. Features & Interactions

### Current Landing Page Features

#### 1. Particle Hero
- Ambient particle canvas with ~50 particles
- Subtle connection lines between nearby particles
- Mouse interaction disabled (ambient only)
- Responsive canvas sizing

#### 2. Scrollytelling Section
- Left panel scrolls naturally
- Right panel sticks and shows current section's visual
- Intersection Observer triggers at 50% visibility
- Minimal geometric transitions (scale, opacity)

#### 3. About Section
- Static content with social links
- Hover effects on links

### Article Navigation Component (Reserved for Future)
- ArticleNav component is **reserved** for use on post detail page
- Will serve as in-article navigation for section positioning
- Not displayed on landing page

### Image Uploader Component (Reserved for Future)
- ParticleUploader component is **reserved** for future functional pages
- Not displayed on landing page

---

## 5. Component Inventory

### Shared Types (`/client/src/types/`)
```
index.ts           - Re-exports all types
article.ts         - Article, ArticleNavItem, ArticleFormData interfaces
narrative.ts       - NarrativeSection interface
uploader.ts        - UploadState, FileItem interfaces
```

### Layout Components (`/client/src/components/ui/`)
```
AppHeader.vue      - Fixed navigation bar with logo and links
AppFooter.vue      - Minimal footer with social links
BaseButton.vue     - Styled button variants (primary, secondary, ghost)
BaseCard.vue       - Surface card container with hover states
```

### Feature Components (`/client/src/components/`)
```
ParticleHero.vue   - Hero with ambient particle canvas
ScrollNarrative.vue - Split-screen scrollytelling showcase
ArticleNav.vue     - Article list with hover effects (for future use)
MarkdownViewer.vue - Markdown content renderer
CodeBlock.vue     - Syntax-highlighted code display
ParticleUploader.vue - Image upload (for future use)
ParticleCanvas.vue - Reusable particle background
```

### Composables (`/client/src/composables/`)
```
useIntersectionObserver.ts  - Intersection Observer wrapper
useScrollProgress.ts        - Scroll progress tracking
useReducedMotion.ts         - Reduced motion preference
```

### Utils (`/client/src/utils/`)
```
formatDate.ts      - Date formatting utilities
apiClient.ts       - API client for backend communication
```

### Views (`/client/src/views/`)
```
HomeView.vue       - Landing page (current focus)
PostView.vue        - Post detail page (future)
```

---

## 6. File Naming Conventions

- **Components**: PascalCase (`ArticleNav.vue`, `ScrollNarrative.vue`)
- **Composables**: camelCase with `use` prefix (`useIntersectionObserver.ts`)
- **Types**: PascalCase (`article.ts`, `NarrativeSection.ts`)
- **Utils**: camelCase (`formatDate.ts`, `apiClient.ts`)
- **Views**: PascalCase (`HomeView.vue`, `PostView.vue`)

---

## 7. Accessibility Requirements

- Full keyboard navigation (Tab, Enter, Escape, Arrow keys)
- `prefers-reduced-motion` reduces/disables animations
- Focus visible states on all focusables
- Semantic HTML structure
- Color contrast ratio ≥ 4.5:1
- ARIA labels on interactive elements

---

## 8. Implementation Status

### Completed
- [x] Project structure setup
- [x] Type definitions organized
- [x] Composables created
- [x] Utility functions created
- [x] Base UI components (Header, Footer, Button, Card)
- [x] ParticleHero component with ambient canvas
- [x] ScrollNarrative component
- [x] Landing page (HomeView) assembled
- [x] PostView with Markdown rendering
- [x] Color scheme refined (subtle, not cyberpunk)

### Reserved for Future
- [ ] ArticleNav for post detail page navigation
- [ ] ParticleUploader for image upload functionality
- [ ] Backend API integration
- [ ] Full blog post CRUD
- [ ] Image upload to server
