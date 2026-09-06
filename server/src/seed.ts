import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_SETTINGS = {
  adExpiryDays: 60,
  bannedItems: [],
  publishingRules: '',
  privacyPolicy: '',
  reportReasons: [
    'اطلاعات نادرست، تقلبی یا گمراه‌کننده',
    'قیمت غیرواقعی یا نامتعارف',
    'کالای ممنوعه یا غیرقانونی در آلمان',
  ],
  rejectReasonTemplates: [
    'عنوان یا توضیحات ناقص / گمراه‌کننده است.',
    'تصاویر نامرتبط، بی‌کیفیت یا ناقص هستند.',
  ],
};

async function main() {
  // Admin user
  await query(
    `INSERT INTO users (id, name, phone, city, role, account_status, created_at)
     VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE', NOW())
     ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', name = EXCLUDED.name`,
    ['admin-1', 'مدیر ارشد سامانه', '+49 170 0000000', 'برلین (Berlin)']
  );

  await query(
    `INSERT INTO platform_settings (id, data, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(DEFAULT_SETTINGS)]
  );

  console.log('Seed complete: admin-1 (+49 170 0000000), platform_settings.');
  console.log('Tip: use POST /api/import with a localStorage dump to load categories/cities/ads.');
  await pool.end();
}

main().catch(async err => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
