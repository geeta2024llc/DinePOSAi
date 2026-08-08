# Architectural Decision Record (ADR) 0003: ESC/POS Thermal Printer Socket Strategy

## 📅 Status
**Accepted**

## 💡 Context
Restaurant POS checkout requires rapid hardware receipt printing and cash drawer triggering without manual user print dialog confirmation steps.

## 🎯 Decision
Implement direct **binary ESC/POS buffer encoding** streaming over raw TCP network sockets (port 9100) with automatic browser HTML print fallback.

## ⚡ Consequences
- **Positive**: Instant receipt printing and cash drawer popping without user intervention.
- **Negative**: Browser environment security restrictions require thermal printers to be accessible on the local network IP subnet or accessed via browser fallback dialogs.

---

## 🔗 Related Documentation

- [[architecture]] — System hardware printing topology and PrinterContext provider.
- [[integrations]] — Technical reference for ESC/POS binary byte stream encoding.
- [[features/hardware-thermal-printing]] — Detailed feature spec for thermal receipt hardware printing.
- [[features/pos-cashier-checkout]] — POS Cashier terminal checkout workflow.

