# 🎨 TimeMaster Design System — Dark Precision

**Version 2.0** | Dark-first + Flexible Primary Accent

This document defines the unified design language for the entire TimeMaster product. It combines the premium precision of Linear with TimeMaster’s core values: clarity, flexibility, and long-hour productivity.

---

## 💎 1. Core Principles

- **Dark-first**: Dark mode is the primary and most refined experience.
- **Neutral First — Smart Accent**: Backgrounds and surfaces remain neutral. Primary color is used only for intentional highlights.
- **Productivity-Oriented**: Optimized for long sessions, reduced eye strain, and deep focus.
- **Precision & Premium Feel**: Every detail should feel engineered, modern, and professional.
- **Flexibility**: Easy to change brand color via the theme system.

---

## 🎨 2. Color Palette

### Dark Mode (Default)

| Role                    | Value                        | Usage                              |
|-------------------------|------------------------------|------------------------------------|
| **Canvas**              | `#0a0a0b`                    | Main app background                |
| **Panel / Sidebar**     | `#111113`                    | Sidebars, modals, drawers          |
| **Surface**             | `#1a1a1e`                    | Cards, tables, dropdowns           |
| **Elevated Surface**    | `#212126`                    | Hover states, elevated panels      |
| **Primary Text**        | `#f4f4f5`                    | Headings and main content          |
| **Secondary Text**      | `#c9cdd6`                    | Body text and descriptions         |
| **Tertiary Text**       | `#8b909a`                    | Labels, metadata, captions         |
| **Muted Text**          | `#5f636d`                    | Placeholders, disabled states      |
| **Border Subtle**       | `rgba(255,255,255,0.06)`     | Very light borders                 |
| **Border Standard**     | `rgba(255,255,255,0.09)`     | Cards, inputs, dividers            |
| **Border Prominent**    | `#2a2a32`                    | Strong separation                  |

### Primary Accent (Flexible)

- Powered by **OKLCH** color system via `useTheme`
- Recommended default: **Indigo** `#6366f1` (hover: `#818cf8`)
- Used for: Primary buttons, active states, progress bars, key icons

### Light Mode (Supported)

- Background: `#f8f9fa`
- Surface: `#ffffff`
- Border: `#e5e7eb`
- Primary Text: `#111113`
- Secondary Text: `#374151`

---

## 🖋️ 3. Typography

**Primary Font**: `Inter Variable`  
**Font Features** (mandatory): `font-feature-settings: "cv01", "ss03"`  
**Signature Weight**: `500` → Use **510** as the default UI weight

### Typography Scale

| Role              | Size     | Weight | Letter Spacing    | Line Height | Usage                          |
|-------------------|----------|--------|-------------------|-------------|--------------------------------|
| Display           | 48px     | 590    | -1.2px            | 1.00        | Hero, main dashboard title     |
| Heading 1         | 32px     | 590    | -0.7px            | 1.10        | Large section titles           |
| Heading 2         | 24px     | 510    | -0.4px            | 1.25        | Card & panel titles            |
| Heading 3         | 20px     | 510    | -0.2px            | 1.30        | Sub headers                    |
| Body Large        | 17px     | 400    | -0.1px            | 1.60        | Long descriptions              |
| Body              | 16px     | 510    | normal            | 1.55        | Default body text              |
| Label / Caption   | 13px     | 510    | 0.2px             | 1.40        | Labels, badges, metadata       |
| Timer / Big Number| 56px+    | 590    | -1.5px            | 1.00        | Timer, statistics, countdown   |
| Monospace         | 14px     | 400    | normal            | 1.50        | Time codes, durations          |

---

## 📦 4. Card & Surface Style (Standard Pattern)

```vue
<div class="bg-surface border border-border-standard rounded-2xl p-6 
            hover:bg-elevated transition-all duration-300 group">
  
  <div class="flex items-center justify-between mb-6">
    <span class="text-xs font-semibold uppercase tracking-widest text-tertiary">
      FOCUS SESSION
    </span>
    
    <div class="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 
                flex items-center justify-center group-hover:border-primary/30 
                group-hover:bg-primary/10 transition-all">
      <Icon class="h-5 w-5 text-secondary group-hover:text-primary" />
    </div>
  </div>

  <div class="text-6xl font-semibold tracking-tighter text-primary-text">
    2h 47m
  </div>
  <div class="text-sm text-tertiary">+18% from last week</div>
</div>
```

**Recommended classes**:
- `bg-surface`
- `border border-border-standard`
- `hover:bg-elevated`
- `rounded-2xl` / `rounded-3xl`

---

## 🔢 5. Input & Form Elements

```vue
<input
  class="w-full bg-[#16161a] border border-border-standard rounded-2xl px-5 py-3.5
         text-primary-text placeholder:text-muted
         focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none
         transition-all text-[15px] font-medium"
/>
```

---

## 🔘 6. Button Styles

- **Primary Button**: `bg-primary text-white hover:brightness-110`
- **Ghost Button**: `bg-white/5 border border-white/10 hover:bg-white/10`
- **Subtle Button**: `hover:bg-white/5 text-secondary`
- **Icon Button**: Circular, `bg-white/5 hover:bg-primary/10`

---

## ⚙️ 7. Technical Implementation

### Global Font Settings
```css
@layer base {
  html {
    font-feature-settings: "cv01", "ss03";
  }
}
```

### Theme System
- Continue using existing `useTheme` composable
- Add semantic color variables:
  - `--surface`, `--elevated`, `--border-standard`
  - `--primary-text`, `--secondary`, `--tertiary`, etc.

### Recommended Tailwind Extensions
```js
theme: {
  extend: {
    colors: {
      surface: '#1a1a1e',
      elevated: '#212126',
      'primary-text': '#f4f4f5',
      secondary: '#c9cdd6',
      tertiary: '#8b909a',
      muted: '#5f636d',
    }
  }
}
```

---

## ✅ 8. Do’s and Don’ts

**Do**
- Always use weight **510** for UI text and labels
- Apply negative letter-spacing on large headings and timer numbers
- Keep card backgrounds subtle and translucent
- Use Primary Accent sparingly and purposefully
- Test both Dark and Light modes

**Don’t**
- Use solid primary-colored backgrounds for cards or panels
- Overuse font-weight 700 (bold)
- Use harsh solid borders
- Use pure `#ffffff` as primary text (use `#f4f4f5` instead)

---

This Design System gives TimeMaster a premium, modern, and highly professional appearance similar to Linear, while preserving full color flexibility and strong productivity focus.

---
