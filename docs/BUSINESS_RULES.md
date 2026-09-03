# Business rules

Product rules extracted from code. Independent of UI styling.

---

## Accounts & auth

1. Users identify by **phone number** (no password).
2. Register requires name + unique phone; login finds user by phone or auto-creates a user if missing (Login.tsx login branch).
3. Roles: `USER` (default), `EDITOR`, `ADMIN`.
4. Creating/editing ads and profile require login (`PrivateRoute`).
5. Admin panel requires `ADMIN` or `EDITOR` (`AdminRoute`).
6. Creating an ad requires a non-empty phone on the user account.

## GDPR / contact data

1. Primary stored contact datum is **phone**.
2. Ad may expose phone, WhatsApp (same account phone), and/or Telegram username via toggles.
3. At least **one** contact method must be enabled on submit (phone display, WhatsApp, or Telegram with username).
4. Violation reports store `reporterUserId`, not separate reporter phone/name.
5. User may delete account (removes user, their ads, their notifications).

## Ad publishing

1. New non-staff ads start as `PENDING`.
2. Staff (ADMIN/EDITOR) ads can publish as `APPROVED` immediately (create path).
3. Title and description are required.
4. Images stored as data-URLs from file picker (client-side).

## Re-moderation on edit

When a non-staff user edits an ad, status becomes `PENDING` **only if** one of these changed:

- title
- description
- images (length or content)

Other fields (price, city, contact toggles, etc.) keep previous status.

Staff edits keep/assign status without forcing PENDING via that path.

## Moderation (DSA-oriented)

1. **Reject** requires a non-empty reason → `REJECTED` + `rejectionReason`; seller notified; appeal link.
2. **Remove** requires a non-empty reason → `REMOVED` + `removalReason`; seller notified; appeal possible.
3. **Approve** clears rejection; sets/refreshes `expiresAt`.
4. Users may **appeal** `REJECTED` or `REMOVED` with a message.
5. Accepting an appeal sets ad back to `PENDING` and clears rejection/removal fields.
6. Public listings show only `APPROVED` (after expiry processing).
7. Owners/staff can view non-approved ads on detail page.

## Reporting

1. Logged-in users can report an ad with a reason from admin-configurable `reportReasons` (+ optional details).
2. Report notifies ADMIN and acknowledges reporter.
3. Admin may resolve (keep), dismiss, or open remove-with-reason flow for the ad.

## Expiry

1. Default lifetime: **60 days** from `createdAt` (`PlatformSettings.adExpiryDays`, editable in admin).
2. On expiry: `APPROVED` → `EXPIRED`; owner notified; activity logged.
3. Expiry runs on app start and when loading public ads.

## User self-delete of ad

1. Before delete, ask whether item was sold: `SOLD` | `NOT_SOLD` | `PREFER_NOT_SAY`.
2. Hard-deletes ad and logs feedback.

## Notifications

Important events should notify the relevant user and/or ADMIN, including: new/pending ads, moderation outcomes, reports, appeals, expiry, support replies (when contact matches a user phone).

Staff see notifications targeted at `ADMIN`; users must not see other users’ private notifs (filter by userId + ALL + staff ADMIN).

## Platform content (admin-editable)

Admins can edit: expiry days, banned items list, publishing rules text, privacy policy text, report reasons, reject templates. Surfaces: Legal pages + report/reject UIs.

## Limits (implementation)

- Notifications stored: max **500**
- Activity logs: max **1000**
- Recent views: max **10** ad ids

## UNKNOWN / NEEDS VERIFICATION

- Rate limits, CAPTCHA, email verification: **not implemented**
- Legal enforceability of demo GDPR/DSA flows vs production compliance: **product/legal review needed**
- Max images per ad: enforced only by UI upload UX — confirm limit in NewAd if changed
