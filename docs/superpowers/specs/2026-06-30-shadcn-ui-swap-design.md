# shadcn/ui Component Swap — Design Spec

**Date:** 2026-06-30
**Status:** Approved (pending user spec review)

## Overview

Replace plain HTML/Tailwind primitives in the Personal Finance Tracker's 5 frontend components with shadcn/ui equivalents. Same behavior, same layout — just cleaner component APIs and accessible form elements.

## Scope

- **Swap UI primitives only** — no layout changes, no new features, no visual overhaul
- **Add Label components** for form field accessibility
- shadcn init adds required dependencies, CSS variables, and config

## Component Mapping

| Current Element | shadcn Component |
|---|---|
| `<div className="bg-white rounded-lg shadow...">` | `Card`, `CardHeader`, `CardContent` |
| `<input type="number|text|date">` | `Input` |
| `<select>` + `<option>` | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` |
| `<input type="radio">` + `<label>` | `RadioGroup`, `RadioGroupItem` |
| `<button>` | `Button` (default, ghost, outline, destructive variants) |
| (new) | `Label` (htmlFor/id association) |

## shadcn Components Added

6 components via CLI: `card`, `input`, `button`, `select`, `radio-group`, `label`

## Files Changed

| File | Change |
|---|---|
| `package.json` | Radix UI + classname deps auto-added by `shadcn init` |
| `components.json` | New — shadcn project config |
| `src/lib/utils.ts` | New — `cn()` utility |
| `src/app/globals.css` | Extended with shadcn CSS variables |
| `tailwind.config.ts` | Extended with shadcn theme config |
| `src/components/ui/*.tsx` | New — 6 shadcn component source files |
| `src/components/TransactionForm.tsx` | Swap primitives: Card, Input, Select, RadioGroup, Button, Label |
| `src/components/TransactionList.tsx` | Swap primitives: Card, Input, Select, Button |
| `src/components/SummaryCards.tsx` | Swap `div` cards with `Card` |
| `src/components/CategoryBreakdown.tsx` | Swap `div` cards with `Card` |
| `src/components/Dashboard.tsx` | No changes (composition only) |

## Constraints

- All files stay under 200 lines
- No logic or API changes — existing 94 tests unaffected
- No new dependencies manually added — all handled by `shadcn init` and `shadcn add`
- Tailwind CSS v3 compatible (use `npx shadcn-ui@latest` for v3 support)
