
# Admin QR Code Generator Tool

## Difficulty: Very Easy

This is a simple feature to implement. All the required pieces already exist in your codebase - we just need to combine them into a new admin page.

---

## What You'll Get

A new **"QR Generator"** tool in the Admin Tools section that allows you to:
- Paste any URL
- Instantly see the generated QR code
- Download as PNG (512x512, high quality)
- Copy the link to clipboard
- Optionally add a label/name for the download filename

---

## Implementation

### 1. Create the Admin Page

**New file:** `src/pages/AdminQRGenerator.tsx`

A simple page with:
- Text input for pasting the URL
- Optional text input for a custom filename
- Live QR code preview (updates as you type)
- Download button (PNG)
- Copy URL button

### 2. Add Route

**File:** `src/App.tsx`

Add the route under admin tools:
```
/admin/qr-generator → AdminQRGenerator
```

### 3. Add to Sidebar

**File:** `src/components/admin/AdminSidebar.tsx`

Add entry to the Tools section:
```
{ title: "QR Generator", url: "/admin/qr-generator", icon: QrCode }
```

---

## UI Design

```text
┌─────────────────────────────────────────┐
│  QR Code Generator                      │
│  Generate QR codes for any URL          │
├─────────────────────────────────────────┤
│                                         │
│  URL *                                  │
│  ┌───────────────────────────────────┐  │
│  │ https://example.com/my-page       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Label (optional - for filename)        │
│  ┌───────────────────────────────────┐  │
│  │ conference-booth                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │    [QR CODE]    │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│     [Copy URL]    [Download PNG]        │
│                                         │
└─────────────────────────────────────────┘
```

---

## Technical Details

### Reusing Existing Code

The download logic from `QRCodeShareCard.tsx` will be adapted:
- Converts SVG to Canvas
- Exports as 512x512 PNG
- Uses label for filename (or "qr-code" as default)

### Components Used

| Component | Source |
|-----------|--------|
| `QRCodeSVG` | `qrcode.react` (already installed) |
| `AdminLayout` | Existing admin wrapper |
| `Card`, `Input`, `Button` | Existing UI components |
| `toast` | For copy/download feedback |

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/AdminQRGenerator.tsx` | New file - the generator page |
| `src/App.tsx` | Add lazy import + route |
| `src/components/admin/AdminSidebar.tsx` | Add menu item to Tools section |

---

## Estimated Effort

About **15 minutes** of implementation time. This is essentially combining existing pieces into a new admin tool.
