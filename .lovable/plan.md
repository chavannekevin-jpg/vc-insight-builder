
# Consulting Rate Calculator — Admin Tool

## Overview
A new admin page at `/admin/consulting-calculator` with an interactive slider that lets you visualize your consulting pricing strategy. As you drag the slider (hours per engagement), the per-hour rate decreases along a curve, and the tool shows both the **listed price** (with 20% markup) and the **negotiation floor** (your actual target rate).

## Pricing Logic

Your base rates (target/floor prices after negotiation):
- 1-4 hours: EUR 250/h
- 1 week (~37.5h): EUR 150/h  
- 1 month (~150h): EUR 100/h

Listed prices (base + 20% markup for negotiation room):
- 1-4 hours: EUR 300/h
- 1 week: EUR 180/h
- 1 month: EUR 120/h

The slider will range from **1h to 150h** (1 month). The rate will interpolate smoothly between the anchor points using a curve, so any in-between value shows a logical rate.

**Constraint**: Max 1/3 of weekly time = **12.5h/week** per single project. The tool will flag when a project exceeds this threshold.

## What you'll see

- **Slider**: Drag from 1h to 150h
- **Hours label**: Shows selected hours + equivalent in weeks/months
- **Listed rate card**: The price you quote (with 20% buffer)
- **Floor rate card**: Your minimum acceptable rate
- **Total engagement value**: Hours x listed rate
- **Negotiation range**: The EUR spread between listed and floor
- **1/3 rule indicator**: Warning if weekly commitment exceeds 12.5h
- **Summary sentence**: e.g. "For a 20h engagement (~0.5 weeks), quote EUR 228/h (total EUR 4,560). Floor: EUR 190/h (EUR 3,800)."

## Technical Details

### New files
- `src/pages/AdminConsultingCalculator.tsx` — The page component with slider, rate interpolation logic, and display cards. Uses `AdminLayout`, the existing `Slider` component, and `Card` from shadcn.

### Modified files
- `src/App.tsx` — Add route: `/admin/consulting-calculator`
- `src/components/admin/AdminSidebar.tsx` — Add "Consulting Rates" item under the Tools collapsible section, using the `DollarSign` or `Calculator` icon

### Rate interpolation
A piecewise linear interpolation between the three anchor points:
- 1h-4h: EUR 250/h (flat)
- 4h-37.5h: linear from EUR 250 to EUR 150
- 37.5h-150h: linear from EUR 150 to EUR 100

The 20% markup is applied on top: `listedRate = floorRate * 1.2`

### No database needed
This is a pure client-side calculator — no backend storage required.
