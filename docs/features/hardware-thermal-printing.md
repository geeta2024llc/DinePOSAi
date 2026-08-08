# Feature Specification: Hardware Thermal Printing

## 🖨 Feature Overview

The **Hardware Thermal Printing Module** provides direct hardware receipt printing and cash drawer kick-out capabilities for POS terminals on the local network.

---

## 🏛 Key Implementation Touchpoints

- **Binary Encoder**: [app/escposEncoder.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/escposEncoder.ts)
- **Socket Interface**: [app/printerService.ts](file:///h:/Antigravity/DinePosAi/apps/web/app/printerService.ts)
- **React Context**: [app/printerContext.tsx](file:///h:/Antigravity/DinePosAi/apps/web/app/printerContext.tsx)

---

## ⚙ Hardware ESC/POS Binary Protocol

Receipts are encoded as ESC/POS byte sequences:
- `0x1B, 0x40`: Initialize printer hardware.
- `0x1B, 0x61, 0x01`: Center-align headers.
- `0x1D, 0x56, 0x00`: Full cut receipt paper.
- `0x1B, 0x70, 0x00, 0x19, 0xFA`: Pulse pin 2 cash drawer kick-out command.

If direct TCP network socket stream creation fails or browser environment blocks socket initialization, system gracefully degrades to standard HTML `window.print()` rendering.

---

## 🔗 Related Documentation

- [[architecture]] — Direct hardware network printing topology and printer context layout.
- [[integrations]] — Technical reference for raw TCP byte streaming on port 9100.
- [[features/pos-cashier-checkout]] — POS Cashier terminal checkout and receipt printing workflow.
- [[decisions/0003-thermal-printer-integration]] — Architectural Decision Record on ESC/POS binary encoding.
