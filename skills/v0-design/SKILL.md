---
name: v0-design
description: 'Generates optimized v0.dev prompts for UI design. Analyzes the project, creates a context message and per-page prompts following Vercel''s three-part framework. Outputs ready-to-copy prompts. Manual via /v0-design.'
argument-hint: "<app-description or feature-name>"
disable-model-invocation: true
allowed-tools: ["Read", "Glob", "Grep", "Agent", "WebSearch", "WebFetch", "Write", "AskUserQuestion"]
---

# /v0-design — Generate v0.dev Design Prompts

Generate optimized prompts for v0.dev (Vercel's AI UI generator) that produce consistent, high-quality, production-ready designs.

## Arguments

```
/v0-design <app-description>
```

- `app-description`: What the user wants to design (e.g., "student portal with dashboard and schedule", "e-commerce checkout flow", "admin panel for analytics")

If no argument is provided, ask what they want to design.

## Core Principles (from Vercel's official v0 docs + research)

1. **Three-part framework** for every prompt: Product Surface (components, features, data), Context of Use (who uses it, when, where), Constraints & Taste (what NOT to invent, style boundaries)
2. **Specificity beats vagueness** — "registration form with name, email, password fields; password validated for 8+ chars" beats "create a form". Specific prompts generate 30-40% faster.
3. **Design system first** — without one, v0 invents styles per-generation and they drift. Define colors, radius, fonts upfront.
4. **One page per prompt** — multi-page dumps produce mess. Context message first, then one prompt per page in the same chat.
5. **~800-1200 words per prompt** — sweet spot from SkillsBench research. Too short = vague output. Too long = ignored details.
6. **Technical steering** — use Tailwind class names for precise control: "make the card rounded-xl with shadow-sm" not "make it rounded with shadow"
7. **Iterate specifically** — "Add a dark mode toggle to the top-right corner of the navbar" not "make it better"

---

## Step 1: Analyze the Project

Read the codebase to understand what exists:

1. **Read project context files** (in order, stop when sufficient):
   - `CLAUDE.md` or `README.md`
   - `package.json`
   - `tailwind.config.ts` or `tailwind.config.js`
   - `src/app/globals.css` or `app/globals.css`
   - Any existing page files to understand current patterns

2. **Identify**:
   - Tech stack (Next.js? React? Vue? etc.)
   - CSS framework (Tailwind? CSS Modules?)
   - Component library (shadcn/ui? MUI? Chakra?)
   - Existing theme/colors (CSS variables, tailwind config)
   - Existing pages and their structure
   - Whether this is a new project or redesign of existing

3. **If no codebase exists** (new project), skip this step and ask the user about their preferred stack.

---

## Step 2: Ask Clarifying Questions

Use **AskUserQuestion** to clarify (ONE question at a time):

**Question 1**: What pages/screens do you need? List them.
- Examples: "Login, Dashboard, Settings" or "Landing page, Pricing, Blog"

**Question 2**: Who is the user? What's their context?
- Examples: "University students on mobile", "Enterprise admins on desktop"

**Question 3**: Any design preferences or references?
- Examples: "Like Linear or Notion", "Colorful and playful", "Minimal and dark"
- Or: "No preference, let v0 decide" (perfectly valid)

**Question 4**: Fresh design or match existing theme?
- If existing project has a theme: "Match the current indigo theme" vs "Start fresh"
- If new project: skip this

Stop asking once enough context is gathered. Do NOT over-ask. 2-4 questions max.

---

## Step 3: Generate the Context Message

Create a context message to paste FIRST in the v0 chat. This sets the tone for all subsequent page prompts.

**Template**:
```
I'm building "[App Name]" — [one-line description]. It's a [framework] app with [component library] + [CSS framework].

The app has these pages: [list all pages].

I'll give you each page one by one. Design them as a cohesive app — same theme, same components, consistent style across all pages. [Design preference if any, or "Pick the best color scheme and design language you think works."] Dark mode required on every page.

[Any special notes: language support, user type, mobile-first, etc.]

Ready? I'll start with [first page name].
```

**Rules for the context message**:
- Under 150 words
- Mention ALL pages so v0 designs with the full app in mind
- State the component library (shadcn/ui, etc.) so v0 uses it
- State dark mode requirement upfront
- Don't prescribe colors unless the user explicitly wants to match existing theme

---

## Step 4: Generate Per-Page Prompts

For each page, generate a prompt following this structure:

```
Design [page description] for "[App Name]".

[PRODUCT SURFACE]
Content and components:
- [Specific element 1]: [what it shows, data fields, states]
- [Specific element 2]: [what it shows]
- [Navigation/layout description]
- [Empty states, loading states if relevant]

[CONTEXT OF USE]
- [Who uses it, when, on what device]
- [What actions they take]

[CONSTRAINTS]
Design requirements:
- [Responsive behavior]
- Dark mode [support/variant]
- [Mobile-specific notes]
- Use [component library], [CSS framework], [icon library], Next.js "use client"
```

**Rules for page prompts**:
- 800-1200 words each (the research-backed sweet spot)
- Include actual text content (especially if non-English — spell out the exact strings)
- Name specific shadcn/ui components when relevant: "use Card, CardContent for the exam cards"
- Describe responsive behavior: "2 columns on desktop, stacks on mobile"
- Include empty states: "If no exams, show calendar icon with 'No upcoming exams' message"
- Include hover/click interactions: "Cards expand on click to show details"
- Use Tailwind class names for precise control where needed: "rounded-xl cards with shadow-sm"

---

## Step 5: Generate Iteration Templates

After the page prompts, provide ready-to-use follow-up prompts:

**Visual tweaks** (use Design Mode — free, no credits):
```
- "Make the cards more spacious — increase padding to p-6"
- "The sidebar is too wide — reduce to 220px"
- "Make the active nav item more prominent"
```

**Structural changes**:
```
- "Add a search bar above the card grid"
- "Move the user avatar to the top-right of the header"
- "Add a 'More' drawer to the mobile bottom nav"
```

**Theme adjustments**:
```
- "Switch to a darker background in dark mode"
- "Make the primary color warmer (more purple, less blue)"
- "Add glassmorphism effect to the login card"
```

---

## Step 6: Output

Write everything to `docs/v0-prompts.md` (or the filename the user specifies).

**File structure**:
```markdown
# v0.dev Design Prompts — [App Name]

## How to Use
1. Start a NEW chat in v0.dev
2. Paste the Context Message first
3. Then paste each page prompt one at a time, in order
4. Iterate with the follow-up templates if needed

## Context Message (paste first)
[generated context message in a code block]

## Page 1: [Name]
[generated prompt in a code block]

## Page 2: [Name]
[generated prompt in a code block]

...

## Iteration Templates
[follow-up prompt templates]

## Tips
- Generate pages in order — v0 builds on previous context
- Use Design Mode for visual tweaks (free, no credits)
- If a page doesn't match the theme, say "Match the style of the previous pages"
- Download zip after each page for backup
```

---

## Quality Checklist

Before outputting, verify each prompt has:
- [ ] Specific component names and data fields (not vague)
- [ ] Responsive behavior described (mobile + desktop)
- [ ] Dark mode mentioned
- [ ] Actual text content in the target language
- [ ] Empty/loading/error states for data-dependent sections
- [ ] Interaction descriptions (hover, click, expand)
- [ ] Between 800-1200 words
- [ ] Component library + CSS framework specified
- [ ] No conflicting instructions

---

## Anti-Patterns (DO NOT)

- Generate one massive prompt with all pages combined
- Use vague language: "make it look nice", "add some cards"
- Prescribe exact hex colors unless the user explicitly wants to match existing theme
- Include backend logic or API calls in prompts — v0 generates UI only
- Skip the context message — without it, each page looks different
- Over-constrain: let v0 choose layout/spacing/animation details within your structure
