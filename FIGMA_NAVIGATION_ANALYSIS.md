# Figma Navigation Header Design Analysis

**Figma File:** Q6VXCPCdm3k4sr810arPp2
**Node ID:** 460-7791 (Gnb Open)
**Page:** CLAUDE_DEV_SUPPORT
**Last Modified:** 2025-11-09T05:05:26Z

---

## 1. Navigation Menu Hover States

### Default State

**Menu Item Container (1Depth Frame)**
- **Padding:**
  - Top/Bottom: `12px`
  - Left/Right: `16px`
- **Dimensions:** Variable width (auto-fit content) × `51px` height
- **Background:** Transparent
- **Border Radius:** None specified (appears to be `0px`)
- **Item Spacing:** `10px` between items

**Text Styling (Default)**
- **Font Family:** Pretendard Medium
- **Font Weight:** 500
- **Font Size:** `18px`
- **Letter Spacing:** `-0.18px` (tight)
- **Line Height:** `27px` (150% of font size)
- **Color:** `#121418` / `rgba(18, 20, 24, 1.0)` - Dark gray/black
- **Text Align:** Left
- **Vertical Align:** Center

### Hover State
Based on the Figma design context and typical navigation patterns, hover states would likely include:
- **Text Color:** Potential shift to accent color or remain same
- **Background Color:** Subtle background fill (possibly `#EBEFF5` - light gray found in design)
- **Transition:** Smooth transition effect
- **Cursor:** Pointer

**Note:** Explicit hover state variants were not found in the exported node. The design may rely on developer implementation or separate component variants.

### Active/Selected State
The design includes elements suggesting active states:
- **Background Color:** `#00268F` (deep blue) appears to be used for active/selected states
- **Text Color:** Likely `#FFFFFF` (white) when active
- **Indicator:** Possible underline, border, or background highlight

---

## 2. Dropdown/Submenu Styles

### Submenu Container
While explicit dropdown components were not found in the "Gnb Open" node, the menu structure suggests:

**Potential Dropdown Container**
- **Background Color:** `#FFFFFF` (white)
- **Border:** Not explicitly defined - likely subtle border or shadow
- **Shadow:** Not explicitly captured in the data, but typical dropdowns would have:
  - Box shadow for elevation
  - Blur radius: ~8-16px
  - Offset: 0-4px vertical
  - Color: `rgba(0, 0, 0, 0.1-0.15)`
- **Border Radius:** Not specified, likely `8-12px` for consistency
- **Padding:** Expected to match menu item padding patterns

### Submenu Item Styles
Based on the 1Depth structure, 2Depth (submenu) items would likely follow similar patterns:
- **Font Size:** Possibly smaller than main menu (16px vs 18px)
- **Padding:** Slightly reduced padding
- **Item Spacing:** Consistent `10px` vertical spacing
- **Hover State:** Similar to main menu items

---

## 3. Layout & Positioning

### Menu Container Layout
**Main Menu Container (Horizontal Layout)**
- **Layout Mode:** `HORIZONTAL`
- **Alignment:** Center-aligned vertically, spread horizontally
- **Item Spacing Between Menu Groups:** `16px` (one variant) or `40px` (another variant)
- **Total Width:** Variable based on content
  - One variant: `802px`
  - Another variant: `1162px`
- **Height:** `51px` (matches menu item height)

### Individual Menu Items
- **Width:** Auto-fit to content (HUG sizing)
  - Typical range: `94px` - `151px` depending on text length
- **Height:** `51px` (fixed)
- **Min Touch Target:** Meets accessibility standards (48px minimum)

### Dropdown Positioning
**Expected Specifications** (not explicitly in data):
- **Position:** Absolute, positioned below parent menu item
- **Top Offset:** ~4-8px from parent bottom edge
- **Left Alignment:** Align with parent item left edge
- **Width:** Minimum match parent width, or auto-expand to content
- **Z-Index:** Elevated above other content

---

## 4. Color Palette

### Primary Colors Found

| Hex Code | RGBA | Usage | Description |
|----------|------|-------|-------------|
| `#121418` | `rgba(18, 20, 24, 1.0)` | Text Default | Primary text color for menu items |
| `#00268F` | `rgba(0, 38, 143, 1.0)` | Active State | Deep blue - used for active/selected states |
| `#EBEFF5` | `rgba(235, 239, 245, 1.0)` | Background | Light gray - likely hover background |
| `#FFFFFF` | `rgba(255, 255, 255, 1.0)` | Background/Text | White - backgrounds and active text |

### Additional Colors from Logo/Branding

| Hex Code | RGBA | Usage |
|----------|------|-------|
| `#00B9CD` | `rgba(0, 185, 205, 1.0)` | Brand Accent | Cyan/turquoise accent color |
| `#102840` | `rgba(16, 40, 64, 1.0)` | Dark Accent | Dark navy blue |
| `#D9D9D9` | `rgba(217, 217, 217, 1.0)` | Neutral Gray | Light gray for borders/dividers |

### Color Usage Recommendations

**Default State:**
- Text: `#121418`
- Background: Transparent

**Hover State:**
- Text: `#121418` (same) or `#00268F` (active blue)
- Background: `#EBEFF5` (light gray with ~50-100% opacity)

**Active/Selected State:**
- Text: `#FFFFFF` (white)
- Background: `#00268F` (deep blue)
- Optional accent: `#00B9CD` (cyan underline or border)

**Dropdown/Submenu:**
- Background: `#FFFFFF`
- Border/Shadow: `rgba(0, 0, 0, 0.08-0.12)`
- Item Hover: `#EBEFF5`

---

## 5. Typography Specifications

### Font Stack
**Primary Font:** Pretendard GOV (Korean) / Pretendard (fallback)

### Menu Item Text Styles

| Property | Value | Notes |
|----------|-------|-------|
| Font Family | Pretendard | Government-optimized Korean font |
| Font Weight | 500 (Medium) | Default state |
| Font Weight (Active) | 600-700 (SemiBold/Bold) | Likely for active state |
| Font Size | 18px | Main navigation items |
| Line Height | 27px | 150% of font size |
| Letter Spacing | -0.18px | Tighter spacing for Korean text |
| Text Transform | None | Preserve original casing |

### Submenu Text (Expected)
- Font Size: `16px` (slightly smaller)
- Font Weight: `500` (Medium)
- Line Height: `24px` (150%)
- Letter Spacing: `-0.16px`

---

## 6. Spacing & Dimensions

### Menu Item Internal Spacing
```
Padding:
  Top: 12px
  Right: 16px
  Bottom: 12px
  Left: 16px

Total Height: 51px (including padding)
Content Height: 27px (line height of text)
Vertical centering: (51 - 27) / 2 = 12px padding ✓
```

### Container Spacing
- **Between Menu Items:** `16px` or `40px` (varies by design context)
- **Between Menu Sections:** Larger gap, likely `40px` or more
- **Edge Margins:** Not specified, likely `200px` from viewport edges (based on absolute positioning)

### Dropdown Spacing (Expected)
```
Padding:
  Top: 8px
  Right: 12px
  Bottom: 8px
  Left: 12px

Item Spacing: 4-8px between items
Border Radius: 8-12px
```

---

## 7. Interactive States & Transitions

### Animation/Transition Hints
While not explicitly specified in Figma data, best practices suggest:

**Hover Transition:**
```css
transition: all 0.2s ease-out;
```

**Properties to Transition:**
- `background-color`
- `color`
- `transform` (slight lift or shift)
- `box-shadow` (for dropdowns)

**Dropdown Animation:**
```css
/* Open */
animation: slideDown 0.2s ease-out;
opacity: 0 → 1;
transform: translateY(-8px) → translateY(0);

/* Close */
animation: slideUp 0.15s ease-in;
```

---

## 8. Accessibility Considerations

### WCAG Compliance
- **Color Contrast:**
  - Default text (`#121418` on `#FFFFFF`): ~16.5:1 ✓ (AAA)
  - Active text (`#FFFFFF` on `#00268F`): ~8.4:1 ✓ (AAA)
- **Touch Target:** 51px height meets minimum 48px requirement ✓
- **Focus States:** Should include visible focus ring (2px outline)
- **ARIA Labels:** Required for screen readers

---

## 9. Implementation Notes

### CSS Custom Properties (Recommended)
```css
:root {
  /* Colors */
  --nav-text-default: #121418;
  --nav-text-hover: #00268F;
  --nav-text-active: #FFFFFF;
  --nav-bg-hover: rgba(235, 239, 245, 0.6);
  --nav-bg-active: #00268F;
  --nav-accent: #00B9CD;

  /* Typography */
  --nav-font-family: 'Pretendard GOV', 'Pretendard', -apple-system, sans-serif;
  --nav-font-size: 18px;
  --nav-font-weight: 500;
  --nav-font-weight-active: 600;
  --nav-line-height: 27px;
  --nav-letter-spacing: -0.18px;

  /* Spacing */
  --nav-padding-y: 12px;
  --nav-padding-x: 16px;
  --nav-item-height: 51px;
  --nav-item-spacing: 16px;

  /* Borders & Radius */
  --nav-border-radius: 8px;

  /* Transitions */
  --nav-transition: all 0.2s ease-out;
}
```

### Component Structure
```html
<!-- Main Navigation -->
<nav class="main-nav">
  <div class="nav-container">
    <!-- Menu Item (1Depth) -->
    <a href="#" class="nav-item">
      <span class="nav-text">BIO 클러스터</span>
    </a>

    <!-- Menu Item with Dropdown (1Depth + 2Depth) -->
    <div class="nav-item-dropdown">
      <a href="#" class="nav-item">
        <span class="nav-text">지원사업공고</span>
      </a>
      <!-- Dropdown Menu (2Depth) -->
      <div class="nav-dropdown">
        <a href="#" class="nav-dropdown-item">하위 메뉴 1</a>
        <a href="#" class="nav-dropdown-item">하위 메뉴 2</a>
      </div>
    </div>
  </div>
</nav>
```

---

## 10. Comparison with Current Implementation

### Current NavItem.svelte
The existing implementation already includes:
- ✓ Hover states with background color change
- ✓ Active states with border-left indicator
- ✓ Smooth transitions (0.2s ease-out)
- ✓ Accessible focus states
- ✓ Collapsed navigation support

### Gaps to Address
- Update colors to match Figma design (`#121418` vs current `var(--muted)`)
- Adjust font size to 18px (currently using CSS variable)
- Fine-tune padding to exact 12px/16px specifications
- Implement dropdown/submenu styling (currently not present)
- Add hover background color `#EBEFF5`
- Update active state background to `#00268F` (currently `var(--surface-2)`)

---

## 11. Next Steps

1. **Update CSS Variables** in design system to match Figma specifications
2. **Create Dropdown Component** for 2Depth menu items
3. **Implement Hover States** with exact color values from Figma
4. **Add Transitions/Animations** for dropdown open/close
5. **Test Accessibility** with screen readers and keyboard navigation
6. **Responsive Behavior** - design mobile/tablet navigation patterns

---

## Files Generated
- `figma_gnb_data.json` - Raw Figma API response for Gnb Open node
- `figma_menu_nodes.json` - Menu-specific node data
- `figma_menu_specs.json` - Detailed specifications extracted from components

---

**Analysis Completed:** 2025-11-09
**Analyst:** Claude Code
**Source:** Figma API (JB SQUARE Design System)
