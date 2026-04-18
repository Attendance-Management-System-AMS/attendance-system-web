# TimeMaster UI Theme Guide

Tai lieu nay mo ta cach ap dung giao dien "dark-first, neutral surface, primary accent" cho TimeMaster theo dung stack hien tai: Vue 3, Tailwind CSS v4, shadcn-vue/Reka UI va he bien CSS trong `src/assets/main.css`.

Muc tieu la dong bo giao dien ma khong pha vo cac component hien co.

---

## 1. Nguyen Tac

- **Dark-first, light-supported**: Dark mode la trai nghiem chinh, nhung light mode van phai doc duoc va dung token.
- **Neutral surface truoc, accent sau**: Nen, card, table, dialog dung mau trung tinh. Mau `primary` chi dung cho CTA, active state, link quan trong, progress va icon nhan manh.
- **Khong hard-code mau moi khi khong can**: Uu tien token semantic nhu `bg-background`, `bg-card`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`.
- **Khong de so lieu gia trong UI van hanh**: Neu chua co API, hien empty state hoac note "chua co API tong hop".
- **Kiosk la ngoai le**: Man hinh camera/kiosk co the full-screen va khong can ep theo card pattern cua dashboard.

---

## 2. Token Mau Dang Dung

Project dang dung Tailwind CSS v4 voi `@theme inline` trong:

`src/assets/main.css`

Token nen tiep tuc dung:

| Vai tro | Class | Ghi chu |
| --- | --- | --- |
| Nen app | `bg-background` | Nen chinh cua layout |
| Chu mac dinh | `text-foreground` | Text chinh theo theme |
| Card / panel | `bg-card text-card-foreground` | Dung cho Card component |
| Border mac dinh | `border-border` | Border chung |
| Muted section | `bg-muted text-muted-foreground` | Empty state, subtitle, disabled-like content |
| Primary accent | `bg-primary text-primary-foreground` | CTA, active state |
| Input border | `border-input` | Input/select/textarea |
| Focus ring | `ring-ring` | Focus visible |

Token bo sung cho huong dark precision:

| Vai tro | Class | Ghi chu |
| --- | --- | --- |
| Surface trung tinh | `bg-surface` | Panel lon, dashboard band |
| Surface hover/elevated | `bg-elevated` | Hover row/card, popover nang nhe |
| Text chinh trong surface | `text-primary-text` | Khi can mau text rieng cho dark surface |
| Text phu | `text-secondary-text` | Mo ta, body phu |
| Text tertiary | `text-tertiary-text` | Label, metadata |
| Border nhe | `border-border-subtle` | Divider rat nhe |
| Border surface | `border-border-standard` | Card/dialog/table surface |

Khong dung ten `text-secondary` cho mau chu phu vi `secondary` da la token semantic hien co cua shadcn-style UI.

---

## 3. Bang Mau

### Dark Mode

| Token | Gia tri tham chieu | Dung cho |
| --- | --- | --- |
| `--background` | gan `#0a0a0b` | Nen app |
| `--card` | gan `#111113` | Card/dialog/sidebar |
| `--surface` | gan `#1a1a1e` | Panel va table surface |
| `--elevated` | gan `#212126` | Hover/elevated panel |
| `--primary-text` | gan `#f4f4f5` | Heading/text chinh |
| `--secondary-text` | gan `#c9cdd6` | Body phu |
| `--tertiary-text` | gan `#8b909a` | Label/metadata |
| `--border-standard` | `rgba(255,255,255,0.09)` | Border card/input |

### Light Mode

Light mode nen giu style sach va de doc:

| Token | Gia tri tham chieu |
| --- | --- |
| `--background` | gan `#f8f9fa` |
| `--card` | `#ffffff` |
| `--surface` | `#ffffff` |
| `--elevated` | `#f3f4f6` |
| `--primary-text` | `#111113` |
| `--secondary-text` | `#374151` |
| `--tertiary-text` | `#6b7280` |

### Primary Accent

Mau primary tiep tuc duoc doi bang `useTheme.ts`.

`useTheme.ts` chi nen dieu khien:

- `--primary`
- `--primary-foreground`
- `--ring`

Khong nen de theme picker doi `surface`, `background`, `foreground`, vi nhu vay moi theme se lam UI mat tinh nhat quan.

---

## 4. Typography

Project hien dung:

```css
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
```

Quy uoc nen dung:

| Vai tro | Class goi y | Ghi chu |
| --- | --- | --- |
| Page title | `text-2xl font-semibold tracking-normal` | Khong ep uppercase toan bo |
| Section title | `text-lg font-semibold tracking-normal` | Dung cho card/panel |
| Body | `text-sm font-medium leading-6` | Noi dung UI |
| Label | `text-xs font-medium text-tertiary-text` | Metadata, form label |
| Number/KPI | `text-3xl font-semibold tabular-nums` | So lieu dashboard |
| Time/code | `font-mono tabular-nums` | Gio vao/ra, duration |

Khong nen ap dung negative letter-spacing rong rai. Tieng Viet co dau de bi chat chu, dac biet tren mobile.

---

## 5. Card Va Surface

Dung component `Card` hien co khi phu hop. Neu can viet surface truc tiep:

```vue
<section class="rounded-lg border border-border-standard bg-surface p-5 text-primary-text">
  <div class="mb-4 flex items-center justify-between">
    <p class="text-xs font-medium text-tertiary-text">Tong quan</p>
    <Icon class="h-4 w-4 text-secondary-text" />
  </div>

  <p class="text-3xl font-semibold tabular-nums">128</p>
  <p class="mt-1 text-sm text-secondary-text">Nhan vien dang hoat dong</p>
</section>
```

Nen:

- `rounded-lg` cho card/form/table wrapper
- `rounded-xl` cho panel lon hoac kiosk overlay
- `border-border-standard` cho surface tren dark mode
- `hover:bg-elevated` cho row/card co interaction

Khong nen:

- Dung `rounded-2xl/3xl` dai tra
- Dung card trong card neu khong co ly do ro
- Dung nen primary cho ca card/panel

---

## 6. Form Va Input

Uu tien shared UI component neu co. Khi can viet input native:

```vue
<input
  class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground
         placeholder:text-muted-foreground outline-none transition
         focus:border-primary focus:ring-2 focus:ring-ring/40"
/>
```

Voi dark surface rieng:

```vue
<input
  class="h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm
         text-primary-text placeholder:text-tertiary-text outline-none
         focus:border-primary focus:ring-2 focus:ring-ring/40"
/>
```

---

## 7. Button

Dung shared `Button` truoc. Neu can class truc tiep:

| Kieu | Class goi y |
| --- | --- |
| Primary | `bg-primary text-primary-foreground hover:brightness-110` |
| Secondary | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| Ghost | `hover:bg-accent hover:text-accent-foreground` |
| Outline | `border border-border bg-background hover:bg-accent` |
| Danger | `bg-destructive text-destructive-foreground hover:brightness-110` |

Khong nen dung primary cho moi nut. Trang quan tri nhieu thao tac nen uu tien outline/ghost, chi CTA chinh dung primary.

---

## 8. Table/Data UI

Bang du lieu la luong quan trong cua he thong cham cong, nen uu tien do doc va density:

- Header: `bg-muted/60 text-muted-foreground`
- Row: `border-b border-border hover:bg-muted/40`
- Status badge dung semantic color rieng, khong chi dung primary.
- Cot thoi gian dung `font-mono tabular-nums`.
- Empty state khong dung mock data.

Semantic status goi y:

| Nghiep vu | Mau |
| --- | --- |
| Co mat/dung gio | emerald |
| Di muon/ve som | amber |
| Vang/lỗi | rose |
| Nghi phep/ngay le | sky/slate |
| Cho duyet | amber/slate |

---

## 9. Layout

Dashboard/admin layout:

- App background: `bg-background`
- Sidebar/navbar: `bg-card border-border`
- Main content: `bg-background`
- Page section: khong can boc them card neu ben trong da co list card/table.

Kiosk:

- Duoc phep full-screen camera.
- Overlay nen dung `bg-black/70`, `backdrop-blur`, border nhe.
- Khong ep kiosk vao `Card` dashboard.

---

## 10. Quy Trinh Migration

Khi doi UI theo guide nay, lam theo thu tu:

1. Cap nhat token trong `src/assets/main.css`.
2. Kiem tra `useTheme.ts` van chi doi primary/ring.
3. Chinh shared UI truoc: `Button`, `Card`, `Input`, `DataTable`, `PageHeader`.
4. Chinh layout: `DashboardLayout`, `AppSidebar`, `AppNavbar`.
5. Chinh tung page nghiep vu.
6. Chay `npm run type-check`, `npm run test:run`, `npm run build-only`.

Khong nen rewrite tat ca page cung luc neu chua co screenshot/QA vi de gay lech spacing, contrast va responsive.

---

## 11. Checklist

Truoc khi merge mot thay doi UI:

- Khong co class mau moi hard-code neu token da co san.
- Dark mode va light mode deu doc duoc.
- Text tieng Viet khong bi chat chu tren mobile.
- Button chinh/phu phan cap ro.
- Bang du lieu khong bi mat density.
- Khong co mock data trong man hinh van hanh.
- Build khong phat sinh warning moi ngoai chunk face-api da biet.

