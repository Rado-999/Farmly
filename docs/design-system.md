# Farmly Emotional Design System

**Codename:** Modern Village Atmosphere  
**Feeling:** warm · earthy · emotional · premium · organic · calm · trustworthy · alive  
**Not:** futuristic · luxury tech · Apple · Airbnb · sterile SaaS

Farmly should feel like stepping into a Bulgarian village at golden hour — wood smoke, dew on grass, a farmer’s voice on film, trust earned slowly. The UI is **cinematic editorial**, not a card catalog.

---

## 1. Design principles

### Emotional north star
| Principle | Meaning in UI |
|-----------|----------------|
| **Place over product** | Lead with landscape, faces, seasons — not SKU grids |
| **Slow trust** | Motion is unhurried; CTAs invite, never push |
| **Material honesty** | Wood, soil, linen, mist — no glassmorphism or neon |
| **Breathing room** | Sections feel like chapters; whitespace is narrative |
| **Alive, not animated** | Drift, grain, light shifts — nothing bouncy or playful-tech |

### Anti-patterns (avoid)
- One flat beige (`#e8e2d4`) on every band
- Identical rounded cards in every grid
- `stone-*` Tailwind defaults as primary palette
- Symmetric 3-column card walls
- Pill buttons everywhere without hierarchy
- Stock-photo brightness; use **grounded** exposure

---

## 2. Color system

### 2.1 Philosophy
Color tells **time of day** and **depth in the land**. Neutrals are **loam** (warm grey-brown), not yellow beige. Greens are **living moss**, not startup sage. Accents are **clay, ember, wheat** — harvest light, not brand neon.

Use **contrast between bands**: parchment → meadow mist → hearth warmth → forest depth. Same-tone stacking only when the narrative continues.

### 2.2 Core palette (tokens)

#### Loam — warm neutrals (structure)
| Token | Hex | Role |
|-------|-----|------|
| `loam-50` | `#faf8f4` | Mist white — page highlights |
| `loam-100` | `#f3efe6` | **Default page ground** (parchment) |
| `loam-200` | `#e6dfd1` | Soft band — replaces flat cream walls |
| `loam-300` | `#d4cabb` | Dividers, subtle borders |
| `loam-400` | `#b8aa94` | Muted UI chrome |
| `loam-500` | `#938471` | Secondary text |
| `loam-600` | `#6f6354` | Body secondary |
| `loam-700` | `#524a3f` | Strong body |
| `loam-800` | `#38322b` | Headlines on light |
| `loam-900` | `#241f1a` | **Foreground** |

#### Moss — living green (trust, nature)
| Token | Hex | Role |
|-------|-----|------|
| `moss-50` | `#eef2eb` | Meadow mist band |
| `moss-100` | `#dde5d8` | Soft green wash |
| `moss-300` | `#8fa384` | Labels, kickers |
| `moss-500` | `#5c6f52` | Primary brand green |
| `moss-700` | `#3d5238` | Links, emphasis |
| `moss-900` | `#1e2e22` | Forest depth |

#### Hearth — warm atmosphere (emotion)
| Token | Hex | Role |
|-------|-----|------|
| `hearth-50` | `#f6f0e8` | Dawn / hearth band |
| `hearth-100` | `#ede4d6` | Warm section wash |
| `hearth-300` | `#d4bc8a` | Wheat accent |
| `hearth-500` | `#c9a06a` | Sun on field |
| `hearth-700` | `#a67c52` | Clay stories |

#### Accent — harvest & soil
| Token | Hex | Role |
|-------|-----|------|
| `clay` | `#a67c52` | Farmer voice, season labels |
| `soil` | `#7a5c3e` | Attribution, earthy copy |
| `ember` | `#c4784a` | Seasonal urgency (sparingly) |
| `wheat` | `#d4bc8a` | Hero kickers on dark |
| `sun` | `#e4c078` | Highlight glint |

#### Semantic aliases (Tailwind / legacy)
| Name | Maps to | Notes |
|------|---------|-------|
| `cream` | `loam-200` | **Accent band only** — not default bg |
| `mist` | `loam-50` | Light surfaces |
| `forest` | `moss-700` | Primary actions |
| `forest-deep` | `moss-900` | Hero scrims, depth sections |
| `sage` | `moss-500` | Icons, badges |
| `background` | `loam-100` | Body |
| `foreground` | `loam-900` | Body text |

### 2.3 Surface & text pairing
| Surface tone | Background | Primary text | Muted text |
|--------------|------------|--------------|------------|
| `parchment` | loam-100 | loam-900 | loam-600 |
| `meadow` | moss-50 | moss-900 | moss-700 |
| `hearth` | hearth-50 → loam-200 gradient | loam-900 | soil |
| `depth` | moss-900 gradient | loam-50 | loam-50/75 |
| `field` (hero) | image + scrim | mist | mist/90 |

### 2.4 Status & feedback
- **Success:** moss-700 on moss-50  
- **Warning:** ember on hearth-50  
- **Error:** `#8b3d32` on `#f8ebe8` (terracotta, not SaaS red)  
- **Info:** loam-700 on loam-100  

---

## 3. Typography

### 3.1 Typefaces
| Role | Family | Variable | Character |
|------|--------|----------|-----------|
| **Display / editorial** | Newsreader | `--font-display` | Poetic, trustworthy headlines |
| **UI / body** | Source Sans 3 | `--font-body` | Calm, readable, Cyrillic-ready |
| **Data / meta** | Geist Mono | `--font-mono` | Duration, IDs — use rarely |

**Do not** swap to geometric sans or luxury serif (Playfair + Inter vibes).

### 3.2 Scale (mobile-first → desktop)

| Token | Size | Line height | Use |
|-------|------|-------------|-----|
| `type-hero` | 2.75rem → 4.5rem | 1.05–1.08 | Landing hero (display) |
| `type-chapter` | 2rem → 3.25rem | 1.12 | Section titles |
| `type-story` | 1.5rem → 2rem | 1.2 | Card titles, farmer names |
| `type-body` | 1rem → 1.125rem | 1.65–1.75 | Paragraphs |
| `type-caption` | 0.8125rem | 1.5 | Kickers, meta |
| `type-label` | 0.75rem | 1.4 | Uppercase labels |

### 3.3 Kicker / eyebrow rules
- Uppercase only for **short** place labels (≤4 words)
- Tracking: `0.12em`–`0.14em` (never `0.22em` — feels corporate)
- Color: `soil` or `clay` on light; `wheat` on dark
- Prefer sentence-case kickers for emotional sections: *„Какво земята предлага сега“*

### 3.4 Weight & style
- Headlines: `font-medium` (500) — not bold SaaS
- Italic display: one line per section max (pull quotes, farmer voice)
- Body: `font-normal`; emphasis via color, not weight

### 3.5 CSS utilities
`.type-hero`, `.type-chapter`, `.type-story`, `.type-body`, `.type-caption`, `.type-label`, `.editorial-serif`

---

## 4. Spacing

### 4.1 Base scale (8px grid)
`1=4px · 2=8px · 3=12px · 4=16px · 5=20px · 6=24px · 8=32px · 10=40px · 12=48px · 16=64px · 20=80px · 24=96px`

### 4.2 Semantic rhythm
| Token | Value | Use |
|-------|-------|-----|
| `stack-tight` | 16px | Form fields |
| `stack-default` | 24px | Card innards |
| `stack-relaxed` | 32px | Hero copy block |
| `content-after-head` | 48–64px | Below section titles |
| `section-inner` | 48–64px | Inside a band |
| `section-gap` | 72–112px | Between narrative chapters |
| `section-join` | 32–48px | Same-surface continuation |

### 4.3 Layout philosophy
- **Editorial rows** over card grids for lists (seasonal food, stories)
- **Asymmetric splits** 60/40 or 55/45 for farmer profiles
- Full-bleed media every 2–3 sections on landing
- Mobile: single column, **generous** vertical rhythm (`py-8` minimum per row)

---

## 5. Radius

Village UI is **soft but not bubbly**.

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 2px | Media frames, editorial crops |
| `radius-md` | 8px | Inputs, tags |
| `radius-lg` | 14px | **Rare** elevated panels |
| `radius-xl` | 20px | Modals only |
| `radius-full` | 9999px | Primary CTA pills only |

**Default media:** `radius-sm` (almost square) — feels documentary.  
**Avoid:** `rounded-2xl` on every thumbnail.

---

## 6. Shadows

Shadows = **late afternoon light**, not Material elevation.

| Token | Value | Use |
|-------|-------|-----|
| `shadow-whisper` | `0 8px 24px -20px rgba(36,31,26,0.18)` | Subtle lift |
| `shadow-soft` | `0 22px 48px -28px rgba(36,31,26,0.22)` | Default panel |
| `shadow-lift` | `0 28px 56px -24px rgba(36,31,26,0.28)` | Hover |
| `shadow-glow` | `0 0 0 1px rgba(92,111,82,0.12)` | Focus ring substitute |
| `shadow-inset` | inset `0 1px 2px rgba(36,31,26,0.06)` | Recessed fields |

**Prefer** border + background shift over shadow on editorial rows.

---

## 7. Textures

### 7.1 Film grain (`.film-grain`)
- Opacity: `0.10` light surfaces · `0.14` on imagery · `0.06` on forms
- Blend: `overlay` on photos; `soft-light` on light bands
- Animated drift: 12–18s — disabled with `prefers-reduced-motion`

### 7.2 Paper / linen (`.texture-linen`)
- Subtle CSS noise at 3% opacity on `parchment` bands
- Never compete with photography

### 7.3 Wood edge (optional `.texture-edge`)
- 1px top border `linear-gradient(90deg, transparent, loam-300, transparent)` between chapters

---

## 8. Gradients

### 8.1 Section bands
| Name | CSS intent |
|------|------------|
| `gradient-dawn` | hearth-50 → loam-200 (morning section) |
| `gradient-meadow` | moss-50 → loam-100 (fresh growth) |
| `gradient-depth` | moss-700 → moss-900 (night field) |
| `gradient-hearth` | hearth-100 → loam-200 (warm indoor) |

### 8.2 Image scrims (cinematic)
- **Hero:** `rgba(30,46,34,0.35)` top → `0.08` mid → `0.82` bottom  
- **Card media:** lighter bottom vignette only  
- **Never** flat `bg-black/50` — always green-brown undertone

### 8.3 Text gradients (sparingly)
- Display accent: `forest-deep` → `soil` on one hero word max

---

## 9. Motion system

### 9.1 Easing
| Token | Curve | Feel |
|-------|-------|------|
| `ease-organic` | `cubic-bezier(0.22, 1, 0.36, 1)` | UI hover, links |
| `ease-cinematic` | `cubic-bezier(0.33, 0, 0.2, 1)` | Reveals, page enter |
| `ease-drift` | `ease-in-out` | Ambient image scale |

### 9.2 Duration
| Token | ms | Use |
|-------|-----|-----|
| `duration-instant` | 150 | Active press |
| `duration-fast` | 300 | Color, border |
| `duration-medium` | 500 | Buttons, cards |
| `duration-slow` | 700 | Section reveals |
| `duration-ambient` | 28000 | `slow-drift` on heroes |

### 9.3 Motion vocabulary
| Class | Behavior |
|-------|----------|
| `reveal-item` | Scroll intersection fade + 28px rise |
| `reveal-rise` | Hero children — gentle scale |
| `slow-drift` | Ken Burns on cover images (1.02→1.04) |
| `grain-shift` | 2% translate on grain layer |

**Rules:** stagger ≤4 children; max 520ms delay; no parallax on mobile; respect `prefers-reduced-motion`.

---

## 10. Cinematic overlays

| Class | Purpose |
|-------|---------|
| `.cinematic-veil` | Deep hero — full height gradient |
| `.cinematic-veil-light` | Cards, discover tiles |
| `.cinematic-vignette` | Radial edge darkening on video thumbs |
| `.film-grain` | Universal atmosphere |

**Stack order (bottom → top):** image → drift → veil → vignette → grain → content

Use `<CinematicMedia>` for any full-bleed story image.

---

## 11. Grain / noise usage

| Context | Grain opacity | Animated? |
|---------|---------------|-----------|
| Landing hero | 0.14 | Yes |
| Farmer hero / video | 0.12 | Yes |
| Light content sections | 0.04–0.06 | No |
| Forms / settings | None | — |
| Modals | 0.08 | No |

Grain is **atmosphere**, not a filter on every div.

---

## 12. Card systems

**Rule:** Cards are **one tool**, not the default layout.

### 12.1 Surface types
| Class | When | Visual |
|-------|------|--------|
| `.surface-ghost` | Lists, seasonal rows | No box — hover wash only |
| `.surface-editorial` | Farmer stories, articles | Bottom border, no shadow |
| `.surface-frame` | Product focus | 1px border, `radius-sm`, light shadow |
| `.surface-card` | **Rare** — dashboards, settings | Rounded panel + shadow |
| `.surface-inset` | Forms, upload zones | Inset shadow, dashed optional |
| `.clickable-card` | Whole-row links | Minimal radius, bg wash on hover |

### 12.2 When to use cards
✅ Settings, auth, upload, dense farmer dashboard  
❌ Landing stories, seasonal list, video gallery (use frames or rows)

### 12.3 Card composition
- Media top or left — never icon + title only  
- Max 1 shadow level per viewport  
- Pair with `story-link`, not tertiary buttons

---

## 13. Section systems

### 13.1 `PageSection` tones
| Tone | Emotion | Use |
|------|---------|-----|
| `parchment` | Calm default | Most pages |
| `meadow` | Fresh, alive | Discover, growers |
| `hearth` / `dawn` | Warm morning | Seasonal, stories |
| `depth` | Night trust | CTAs, footer bands |
| `transparent` | Over hero | — |
| `field` | Full-bleed media | Inline cinematic blocks |

### 13.2 Section anatomy
```
[ optional full-bleed media ]
  page-shell | page-shell-wide
    StoryHeading (kicker + chapter title)
    content-after-head
    [ editorial list | split layout | asymmetric grid ]
```

### 13.3 Spacing classes
`section-space` · `section-space-compact` · `section-space-hero`  
Same-surface join via `data-surface` (already in CSS).

---

## 14. CTA philosophy

### Hierarchy
1. **Primary** — one per viewport: filled moss, pill, warm shadow  
2. **Secondary** — outline / mist fill, blends with parchment  
3. **Quiet** — `story-link` with arrow; main path for exploration  

### Copy tone
- Invite: *„Виж как селото се събужда“*  
- Not: *„Get started“*, *„Shop now“*, *„Sign up free“*

### Placement
- Hero: secondary + quiet (not two primaries)  
- End of section: quiet link to next chapter  
- Purchase: never on landing — trust first  

### Visual
- Primary: `bg-forest` → hover `forest-deep`  
- Secondary: `bg-mist/80` + backdrop blur on imagery only  
- Min tap target: 44px height  

---

## 15. Iconography

### Direction
- **Stroke icons** 1.5px, rounded caps — Lucide-style but warmer  
- Size: 20px inline · 24px navigation  
- Color: `moss-700` on light · `loam-50` on dark — never pure black  
- **No** filled icon sets, no emoji-as-icon in product UI  

### Semantic icons
| Concept | Icon approach |
|---------|----------------|
| Video | Play in soft circle frame |
| Location | Pin with organic teardrop |
| Season | Sun/leaf line — not calendar SaaS |
| Trust | Handshake or heart-in-circle — sparingly |

### Avoid
- Gradient icons, 3D illustrations, avatar circles with status dots everywhere

---

## 16. Image treatment

### Photography
- **Exposure:** slightly underexposed, lifted shadows — “morning field”  
- **White balance:** warm (+200K), never clinical blue  
- **Crop:** documentary — subject off-center, environment visible  
- **Aspect ratios:** 16:9 hero · 4:5 portraits · 1:1 product (square crop, `radius-sm`)

### Processing stack
1. `object-cover` + `slow-drift` on heroes  
2. Green-brown scrim (not neutral black)  
3. `film-grain` overlay  
4. Optional bottom vignette on thumbnails  

### Placeholders
- Gradient from product/farmer metadata (`gradient-meadow`, `gradient-hearth`)  
- Never flat `bg-stone-100` blocks  

### Video thumbnails
- Darker vignette + duration in mono caption  
- Play affordance: subtle, not YouTube red

---

## 17. Mobile design direction

### Layout
- Single column narrative — scroll is the story  
- Sticky header: translucent `loam-50/90` + blur, not solid bar  
- Touch targets ≥44px; `action-row` stacks vertically  

### Typography
- Hero: `text-[2.75rem]` minimum — don’t shrink below emotional impact  
- Section titles: `text-3xl` — still serif display  

### Media
- Full-bleed width with `px` only on text blocks  
- Video: edge-to-edge, controls thumb-friendly  

### Motion
- Reduce stagger on mobile (max 2 items)  
- Disable `slow-drift` below `640px` if performance suffers  

### Gestures
- Pull-to-refresh: not custom — native browser  
- Horizontal scroll: only for video rails, with fade edge hint  

---

## 18. Component quick reference

| Need | Reach for |
|------|-----------|
| Page band | `PageSection` + tone |
| Hero image | `CinematicMedia` |
| Section title | `StoryHeading` |
| Primary action | `ButtonLink variant="primary"` |
| Explore more | `story-link` |
| List of stories | `surface-ghost` + `editorial-row` |
| Settings form | `surface-card` or `surface-inset` |
| Scroll reveal | `RevealOnScroll` / `RevealStagger` |

---

## 19. Implementation map

| Layer | Location |
|-------|----------|
| CSS tokens | `src/styles/farmly-*.css` → imported in `globals.css` |
| TS constants | `src/lib/design/tokens.ts` |
| Atmosphere utils | `globals.css` — grain, veils, links |
| Cursor rule | `.cursor/rules/design-system.mdc` |

When adding UI, ask: *Does this feel like a village morning, or a beige app?*
