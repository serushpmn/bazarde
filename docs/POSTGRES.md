# PostgreSQL migration (Bazaar)

مرورگر **نمی‌تواند** مستقیم به PostgreSQL وصل شود. لایه `server/` یک API روی Express + `pg` است.

## معماری فعلی (مرحله ۱)

```
React SPA  ←→  localStorage (StorageService — بدون تغییر رفتار)
     │
     │  pull / push (اختیاری)
     ▼
Express :4000  ←→  PostgreSQL 18 (Windows)
```

- `GET /api/bootstrap` → خواندن کل داده از PG
- `POST /api/import` → ایمپورت dump از localStorage
- با `VITE_API_URL` می‌توانید هنگام استارت اپ از PG بخوانید

مرحله بعد (اختیاری): هر `save*` مستقیماً به API بنویسد.

---

## پیش‌نیاز Windows

1. سرویس `postgresql-x64-18` در حال اجرا باشد (شما دارید).
2. رمز کاربر `postgres` را بدانید (هنگام نصب تنظیم شده).
3. `psql` در PATH نیست؛ مسیر کامل:

`C:\Program Files\PostgreSQL\18\bin\psql.exe`

---

## راه‌اندازی

```powershell
cd "d:\Cursor Projects\bazaar\server"
copy .env.example .env
# در .env رمز را جایگزین کنید:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/bazaar

npm install
npm run db:setup
npm run dev
```

تست سلامت: http://localhost:4000/api/health

---

## فرانت

در ریشه پروژه فایل `.env.local`:

```
VITE_API_URL=http://localhost:4000
```

سپس `npm run dev` (پورت ۳۰۰۰).

اگر API در دسترس باشد، اپ هنگام لود از PG **pull** می‌کند.

برای **ارسال** داده فعلی مرورگر به PG، در کنسول مرورگر:

```js
const { pushToPostgres } = await import('/services/postgresSync.ts');
// یا از پنل ادمین دکمه همگام‌سازی (اگر اضافه شده)
```

یا در DevTools → Application → Local Storage را نگه دارید و یک‌بار `pushToPostgres()` را از UI ادمین بزنید.

---

## اسکیما

فایل: `server/src/schema.sql`

جداول اصلی: `users`, `ads`, `categories`, `cities`, `banners`, `platform_settings`, `notifications`, `appeals`, `violation_reports`, `activity_logs`, `account_deletion_requests`, `otp_challenges`, `phone_restrictions`, `bookmarks`, `recent_views`

---

## عیب‌یابی

| خطا | راه حل |
|-----|--------|
| password authentication failed | رمز `DATABASE_URL` را درست کنید |
| database "bazaar" does not exist | `npm run db:migrate` دیتابیس را می‌سازد |
| ECONNREFUSED 5432 | سرویس PostgreSQL را Start کنید |
| CORS | `CORS_ORIGIN=http://localhost:3000` در `server/.env` |
