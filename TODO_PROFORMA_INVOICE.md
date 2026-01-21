# TODO - Professional Proforma Invoice Implementation

## Objective
Update the proforma invoice table in the prestation form to use a professional HTML table structure with fixed column widths and controlled CSS alignment.

## Plan

### 1. Update HTML Structure (prestation-form.component.html)
- [x] Update proforma table HTML to use the exact structure provided
- [x] Add proper class names for columns: col-item, col-price, col-qty, col-amount
- [x] Maintain footer structure for item count and totals

### 2. Update CSS Styles (prestation-form.component.css)
- [x] Add `table-layout: fixed` to `.invoice-table`
- [x] Set fixed column widths: Item 45%, Price 20%, Qty 15%, Amount 20%
- [x] Configure text alignments: left, right, center, right
- [x] Add proper styling for header and data cells
- [x] Style footer with proper alignment

### 3. Verify Implementation
- [x] HTML structure updated
- [x] CSS styles updated
- [ ] Test table rendering in browser
- [ ] Test PDF export functionality
- [ ] Verify responsive behavior

## Technical Specifications

### Column Configuration
| Column | Width | Alignment | CSS Class |
|--------|-------|-----------|-----------|
| ITEM | 45% | Left | .col-item |
| Prix unitaire | 20% | Right | .col-price |
| Quantité | 15% | Center | .col-qty |
| Montant | 20% | Right | .col-amount |

### Footer Configuration
- Row 1: "Nombre d'items :" (colspan=2, right-aligned) + count (center) + empty
- Row 2: "Montant total :" (colspan=3, right-aligned) + total (right-aligned)

## Files Modified
- `frontend/src/app/features/prestations/components/prestation-form/prestation-form.component.html`
- `frontend/src/app/features/prestations/components/prestation-form/prestation-form.component.css`

## Status
- [x] Plan created
- [x] HTML structure updated
- [x] CSS styles updated
- [ ] Implementation verified

