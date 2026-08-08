# Architectural Decision Record (ADR) 0004: AI Concierge Integration with Google Gemini

## 📅 Status
**Accepted**

## 💡 Context
The digital guest menu needed an interactive sommelier recommendation assistant capable of answering dish and beverage questions using venue-specific menu data.

## 🎯 Decision
Integrate **Google Gemini REST API (`gemini-1.5-flash`)** via a public Express endpoint (`POST /api/concierge/chat`). The backend queries live menu categories and items for the venue and injects them as structured system prompt context.

## ⚡ Consequences
- **Positive**: Accurate, dish-specific recommendations without hallucinating non-existent menu items.
- **Positive**: Low latency responses using `gemini-1.5-flash`.
- **Negative**: Requires rate-limiting (`conciergeLimiter`) to manage API quota usage.

---

## 🔗 Related Documentation

- [[architecture]] — Public API routing for AI Concierge and Gemini API integration.
- [[integrations]] — Technical reference for Google Gemini REST API configuration.
- [[features/digital-menu-ai-concierge]] — Detailed feature spec for Digital Guest Menu & Aura AI Sommelier.

