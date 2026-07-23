# CoBlog Memory

## 2026-07-23
- Repository has been simplified to a dual-app layout with `apps/client` and `apps/server`, managed from the root with plain `pnpm` scripts.
- Backend stack is `NestJS + Mongoose + MongoDB`.
- Frontend stack is `Vue 3 + Vite + Element Plus`.
- Current user direction:
  - remove unnecessary monorepo complexity;
  - fix internal dangerous bugs first;
  - defer new AI/RAG feature work until security and engineering basics are stabilized.
- Initial backend risk review found likely first-stop issues:
  - CORS was overly permissive in `apps/server/src/main.ts`;
  - upload flow stores binary data directly in Mongo and lacked strict content validation;
  - public message and visit endpoints are easy to abuse and need stronger rate limiting / trust boundaries;
  - SSE auth used query token and message status recovery exposed `senderId`.
- First hardening batch completed:
  - CORS now uses explicit allowlist logic with safe local defaults;
  - upload endpoint now rejects missing files, restricts MIME types, and validates image magic bytes;
  - message “mine” recovery now uses an httpOnly cookie instead of URL senderId enumeration;
  - admin SSE now authenticates through `refresh_token` cookie instead of query-string token.
- Redis rate limiting was introduced for login, message creation, uploads, visitor tracking, and AI article endpoints using a sliding-window sorted-set approach.
- Message visitor recovery now uses a backend-issued signed `visitor_token` httpOnly cookie. The frontend no longer creates or submits message `senderId`; the existing `Message.senderId` database field stores the verified anonymous visitor id for compatibility.
- Visitor identity is intentionally separate from admin identity: admin login continues to use `refresh_token`, while anonymous message recovery uses `visitor_token`. `VISITOR_TOKEN_SECRET` is preferred for visitor token signing, with `JWT_SECRET` as a compatibility fallback.
