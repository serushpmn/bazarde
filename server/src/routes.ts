import { Router } from 'express';
import { query } from './db.js';
import {
  mapAd,
  mapBanner,
  mapCategory,
  mapCity,
  mapNotification,
  mapUser,
  ts,
} from './mappers.js';

export const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, db: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/** Full snapshot for SPA bootstrap (replaces reading all localStorage keys) */
apiRouter.get('/bootstrap', async (_req, res) => {
  try {
    const [users, ads, categories, cities, banners, settings, notifications, reports, appeals, logs, support, deletions, restrictions] =
      await Promise.all([
        query('SELECT * FROM users ORDER BY created_at NULLS LAST'),
        query('SELECT * FROM ads ORDER BY created_at DESC'),
        query('SELECT * FROM categories ORDER BY sort_order, name'),
        query('SELECT * FROM cities ORDER BY sort_order, name'),
        query('SELECT * FROM banners ORDER BY sort_order, id'),
        query('SELECT data FROM platform_settings WHERE id = 1'),
        query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 500'),
        query('SELECT * FROM violation_reports ORDER BY created_at DESC'),
        query('SELECT * FROM appeals ORDER BY created_at DESC'),
        query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 1000'),
        query('SELECT * FROM support_messages ORDER BY created_at DESC'),
        query('SELECT * FROM account_deletion_requests ORDER BY created_at DESC'),
        query('SELECT * FROM phone_restrictions'),
      ]);

    res.json({
      users: users.rows.map(mapUser),
      ads: ads.rows.map(mapAd),
      categories: categories.rows.map(mapCategory),
      cities: cities.rows.map(mapCity),
      banners: banners.rows.map(mapBanner),
      settings: settings.rows[0]?.data ?? {},
      notifications: notifications.rows.map(mapNotification),
        violationReports: reports.rows.map(row => ({
          id: row.id,
          adId: row.ad_id,
          adTitle: row.ad_title,
          adCity: row.ad_city,
          adPrice: Number(row.ad_price),
          adImage: row.ad_image ?? undefined,
          adUserId: row.ad_user_id,
          reporterUserId: row.reporter_user_id ?? undefined,
          reason: row.reason,
          details: row.details ?? undefined,
          createdAt: new Date(row.created_at).getTime(),
          status: row.status,
        })),
        appeals: appeals.rows.map(row => ({
          id: row.id,
          adId: row.ad_id,
          adTitle: row.ad_title,
          userId: row.user_id,
          type: row.type,
          originalReason: row.original_reason,
          message: row.message,
          status: row.status,
          adminReply: row.admin_reply ?? undefined,
          createdAt: new Date(row.created_at).getTime(),
          resolvedAt: row.resolved_at ? new Date(row.resolved_at).getTime() : undefined,
        })),
        activityLogs: logs.rows.map(row => ({
          id: row.id,
          actorId: row.actor_id ?? undefined,
          actorName: row.actor_name ?? undefined,
          actorRole: row.actor_role ?? undefined,
          action: row.action,
          targetType: row.target_type,
          targetId: row.target_id ?? undefined,
          details: row.details ?? undefined,
          createdAt: new Date(row.created_at).getTime(),
        })),
        supportMessages: support.rows.map(row => ({
          id: row.id,
          name: row.name,
          contact: row.contact,
          subject: row.subject,
          message: row.message,
          createdAt: new Date(row.created_at).getTime(),
          reply: row.reply ?? undefined,
          isReplied: row.is_replied,
        })),
        accountDeletionRequests: deletions.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          requestedAt: new Date(row.requested_at).getTime(),
          scheduledFor: new Date(row.scheduled_for).getTime(),
          cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).getTime() : undefined,
          completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
          reason: row.reason ?? undefined,
          reasonDetails: row.reason_details ?? undefined,
          status: row.status,
          createdAt: new Date(row.created_at).getTime(),
        })),
        phoneRestrictions: restrictions.rows.map(row => ({
          phone: row.phone,
          reason: row.reason,
          createdAt: new Date(row.created_at).getTime(),
          note: row.note ?? undefined,
        })),
      });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'bootstrap_failed', detail: String(e) });
  }
});

// ——— Users ———
apiRouter.get('/users', async (_req, res) => {
  const r = await query('SELECT * FROM users');
  res.json(r.rows.map(mapUser));
});

apiRouter.get('/users/by-phone/:phone', async (req, res) => {
  const r = await query(
    `SELECT * FROM users WHERE phone = $1
     AND account_status NOT IN ('ANONYMIZED', 'DELETED')
     LIMIT 1`,
    [req.params.phone]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
  res.json(mapUser(r.rows[0]));
});

apiRouter.put('/users/:id', async (req, res) => {
  const u = req.body;
  await query(
    `INSERT INTO users (
      id, name, phone, city, role, avatar, account_status, created_at, updated_at,
      phone_verified_at, deletion_requested_at, deletion_scheduled_at, deletion_cancelled_at,
      deleted_at, anonymized_at, deletion_reason, deletion_reason_details,
      deactivated_at, banned_at, ban_reason, suspended_at, suspension_reason, saved_ad_ids
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,COALESCE($8::timestamptz, NOW()), NOW(),
      $9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      city = EXCLUDED.city,
      role = EXCLUDED.role,
      avatar = EXCLUDED.avatar,
      account_status = EXCLUDED.account_status,
      updated_at = NOW(),
      phone_verified_at = EXCLUDED.phone_verified_at,
      deletion_requested_at = EXCLUDED.deletion_requested_at,
      deletion_scheduled_at = EXCLUDED.deletion_scheduled_at,
      deletion_cancelled_at = EXCLUDED.deletion_cancelled_at,
      deleted_at = EXCLUDED.deleted_at,
      anonymized_at = EXCLUDED.anonymized_at,
      deletion_reason = EXCLUDED.deletion_reason,
      deletion_reason_details = EXCLUDED.deletion_reason_details,
      deactivated_at = EXCLUDED.deactivated_at,
      banned_at = EXCLUDED.banned_at,
      ban_reason = EXCLUDED.ban_reason,
      suspended_at = EXCLUDED.suspended_at,
      suspension_reason = EXCLUDED.suspension_reason,
      saved_ad_ids = EXCLUDED.saved_ad_ids`,
    [
      u.id,
      u.name,
      u.phone ?? '',
      u.city ?? null,
      u.role ?? 'USER',
      u.avatar ?? null,
      u.accountStatus ?? 'ACTIVE',
      ts(u.createdAt),
      ts(u.phoneVerifiedAt),
      ts(u.deletionRequestedAt),
      ts(u.deletionScheduledAt),
      ts(u.deletionCancelledAt),
      ts(u.deletedAt),
      ts(u.anonymizedAt),
      u.deletionReason ?? null,
      u.deletionReasonDetails ?? null,
      ts(u.deactivatedAt),
      ts(u.bannedAt),
      u.banReason ?? null,
      ts(u.suspendedAt),
      u.suspensionReason ?? null,
      JSON.stringify(u.savedAdIds ?? []),
    ]
  );
  const r = await query('SELECT * FROM users WHERE id = $1', [u.id]);
  res.json(mapUser(r.rows[0]));
});

// ——— Ads ———
apiRouter.get('/ads', async (req, res) => {
  const status = req.query.status as string | undefined;
  const r = status
    ? await query('SELECT * FROM ads WHERE status = $1 ORDER BY created_at DESC', [status])
    : await query('SELECT * FROM ads ORDER BY created_at DESC');
  res.json(r.rows.map(mapAd));
});

apiRouter.get('/ads/:id', async (req, res) => {
  const r = await query('SELECT * FROM ads WHERE id = $1', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
  res.json(mapAd(r.rows[0]));
});

apiRouter.put('/ads/:id', async (req, res) => {
  const a = req.body;
  await query(
    `INSERT INTO ads (
      id, user_id, title, description, price, currency, is_negotiable, is_free, is_urgent, is_promoted,
      condition, city, state, district, category_id, sub_category_id, images, status, created_at, expires_at,
      contact_phone, show_phone, allow_whatsapp, telegram_id, show_telegram,
      rejection_reason, removal_reason, removed_at, removed_by, sold_feedback, views_count,
      is_verified_seller, attributes, previous_status, archived_at, deletion_reason
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17::jsonb,$18,COALESCE($19::timestamptz, NOW()),$20,
      $21,$22,$23,$24,$25,
      $26,$27,$28,$29,$30,$31,
      $32,$33::jsonb,$34,$35,$36
    )
    ON CONFLICT (id) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      currency = EXCLUDED.currency,
      is_negotiable = EXCLUDED.is_negotiable,
      is_free = EXCLUDED.is_free,
      is_urgent = EXCLUDED.is_urgent,
      is_promoted = EXCLUDED.is_promoted,
      condition = EXCLUDED.condition,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      district = EXCLUDED.district,
      category_id = EXCLUDED.category_id,
      sub_category_id = EXCLUDED.sub_category_id,
      images = EXCLUDED.images,
      status = EXCLUDED.status,
      expires_at = EXCLUDED.expires_at,
      contact_phone = EXCLUDED.contact_phone,
      show_phone = EXCLUDED.show_phone,
      allow_whatsapp = EXCLUDED.allow_whatsapp,
      telegram_id = EXCLUDED.telegram_id,
      show_telegram = EXCLUDED.show_telegram,
      rejection_reason = EXCLUDED.rejection_reason,
      removal_reason = EXCLUDED.removal_reason,
      removed_at = EXCLUDED.removed_at,
      removed_by = EXCLUDED.removed_by,
      sold_feedback = EXCLUDED.sold_feedback,
      views_count = EXCLUDED.views_count,
      is_verified_seller = EXCLUDED.is_verified_seller,
      attributes = EXCLUDED.attributes,
      previous_status = EXCLUDED.previous_status,
      archived_at = EXCLUDED.archived_at,
      deletion_reason = EXCLUDED.deletion_reason`,
    [
      a.id,
      a.userId,
      a.title,
      a.description ?? '',
      a.price ?? 0,
      a.currency ?? 'EUR',
      Boolean(a.isNegotiable),
      Boolean(a.isFree),
      Boolean(a.isUrgent),
      Boolean(a.isPromoted),
      a.condition ?? null,
      a.city,
      a.state ?? null,
      a.district ?? null,
      a.categoryId,
      a.subCategoryId ?? null,
      JSON.stringify(a.images ?? []),
      a.status,
      ts(a.createdAt),
      ts(a.expiresAt),
      a.contactPhone ?? '',
      a.showPhone !== false,
      Boolean(a.allowWhatsapp),
      a.telegramId ?? null,
      Boolean(a.showTelegram),
      a.rejectionReason ?? null,
      a.removalReason ?? null,
      ts(a.removedAt),
      a.removedBy ?? null,
      a.soldFeedback ?? null,
      a.viewsCount ?? 0,
      Boolean(a.isVerifiedSeller),
      a.attributes ? JSON.stringify(a.attributes) : null,
      a.previousStatus ?? null,
      ts(a.archivedAt),
      a.deletionReason ?? null,
    ]
  );
  const r = await query('SELECT * FROM ads WHERE id = $1', [a.id]);
  res.json(mapAd(r.rows[0]));
});

apiRouter.delete('/ads/:id', async (req, res) => {
  await query('DELETE FROM ads WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ——— Categories / Cities / Banners / Settings ———
apiRouter.put('/categories/:id', async (req, res) => {
  const c = req.body;
  await query(
    `INSERT INTO categories (id, name, slug, icon, is_active, subcategories)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, slug = EXCLUDED.slug, icon = EXCLUDED.icon,
       is_active = EXCLUDED.is_active, subcategories = EXCLUDED.subcategories`,
    [c.id, c.name, c.slug, c.icon ?? 'Layers', c.isActive !== false, JSON.stringify(c.subcategories ?? [])]
  );
  res.json({ ok: true });
});

apiRouter.delete('/categories/:id', async (req, res) => {
  await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

apiRouter.put('/cities', async (req, res) => {
  const cities = req.body as { name: string; isActive?: boolean }[];
  if (!Array.isArray(cities)) return res.status(400).json({ error: 'expected_array' });
  await query('DELETE FROM cities');
  for (let i = 0; i < cities.length; i++) {
    const c = cities[i];
    await query(
      `INSERT INTO cities (name, is_active, sort_order) VALUES ($1,$2,$3)
       ON CONFLICT (name) DO UPDATE SET is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order`,
      [c.name, c.isActive !== false, i]
    );
  }
  res.json({ ok: true });
});

apiRouter.put('/banners/:id', async (req, res) => {
  const b = req.body;
  await query(
    `INSERT INTO banners (id, image_url, title, link, position, alt_text, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET
       image_url = EXCLUDED.image_url, title = EXCLUDED.title, link = EXCLUDED.link,
       position = EXCLUDED.position, alt_text = EXCLUDED.alt_text, is_active = EXCLUDED.is_active`,
    [b.id, b.imageUrl, b.title ?? null, b.link ?? null, b.position, b.altText ?? null, b.isActive !== false]
  );
  res.json({ ok: true });
});

apiRouter.delete('/banners/:id', async (req, res) => {
  await query('DELETE FROM banners WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

apiRouter.put('/settings', async (req, res) => {
  await query(
    `INSERT INTO platform_settings (id, data, updated_at) VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [JSON.stringify(req.body)]
  );
  res.json({ ok: true });
});

/**
 * Bulk import from a SPA localStorage dump:
 * { users, ads, categories, cities, banners, settings, ... }
 */
apiRouter.post('/import', async (req, res) => {
  const dump = req.body || {};
  const client = await (await import('./db.js')).pool.connect();
  try {
    await client.query('BEGIN');

    if (Array.isArray(dump.users)) {
      for (const u of dump.users) {
        await client.query(
          `INSERT INTO users (id, name, phone, city, role, avatar, account_status, created_at, saved_ad_ids)
           VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'ACTIVE'),COALESCE($8::timestamptz, NOW()), $9::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [
            u.id,
            u.name,
            u.phone ?? '',
            u.city ?? null,
            u.role ?? 'USER',
            u.avatar ?? null,
            u.accountStatus ?? 'ACTIVE',
            ts(u.createdAt),
            JSON.stringify(u.savedAdIds ?? []),
          ]
        );
      }
    }

    if (Array.isArray(dump.categories)) {
      for (const c of dump.categories) {
        await client.query(
          `INSERT INTO categories (id, name, slug, icon, is_active, subcategories)
           VALUES ($1,$2,$3,$4,$5,$6::jsonb)
           ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, subcategories=EXCLUDED.subcategories, is_active=EXCLUDED.is_active`,
          [c.id, c.name, c.slug, c.icon ?? 'Layers', c.isActive !== false, JSON.stringify(c.subcategories ?? [])]
        );
      }
    }

    if (Array.isArray(dump.cities)) {
      await client.query('DELETE FROM cities');
      for (let i = 0; i < dump.cities.length; i++) {
        const c = dump.cities[i];
        const name = typeof c === 'string' ? c : c.name;
        const isActive = typeof c === 'string' ? true : c.isActive !== false;
        await client.query(
          `INSERT INTO cities (name, is_active, sort_order) VALUES ($1,$2,$3)
           ON CONFLICT (name) DO UPDATE SET is_active = EXCLUDED.is_active`,
          [name, isActive, i]
        );
      }
    }

    if (Array.isArray(dump.ads)) {
      for (const a of dump.ads) {
        // Ensure user exists for FK
        await client.query(
          `INSERT INTO users (id, name, phone, role) VALUES ($1,'Imported','', 'USER')
           ON CONFLICT (id) DO NOTHING`,
          [a.userId]
        );
        await client.query(
          `INSERT INTO ads (
            id, user_id, title, description, price, currency, city, category_id, images, status,
            created_at, contact_phone, show_phone, allow_whatsapp
          ) VALUES (
            $1,$2,$3,$4,$5,COALESCE($6,'EUR'),$7,$8,$9::jsonb,COALESCE($10,'PENDING'),
            COALESCE($11::timestamptz, NOW()), COALESCE($12,''), COALESCE($13,TRUE), COALESCE($14,FALSE)
          )
          ON CONFLICT (id) DO NOTHING`,
          [
            a.id,
            a.userId,
            a.title,
            a.description ?? '',
            a.price ?? 0,
            a.currency,
            a.city,
            a.categoryId,
            JSON.stringify(a.images ?? []),
            a.status,
            ts(a.createdAt),
            a.contactPhone,
            a.showPhone,
            a.allowWhatsapp,
          ]
        );
      }
    }

    if (Array.isArray(dump.banners)) {
      for (const b of dump.banners) {
        await client.query(
          `INSERT INTO banners (id, image_url, title, link, position, is_active)
           VALUES ($1,$2,$3,$4,COALESCE($5,'HOME_TOP'),COALESCE($6,TRUE))
           ON CONFLICT (id) DO NOTHING`,
          [b.id, b.imageUrl, b.title ?? null, b.link ?? null, b.position, b.isActive]
        );
      }
    }

    if (dump.settings && typeof dump.settings === 'object') {
      await client.query(
        `INSERT INTO platform_settings (id, data) VALUES (1, $1::jsonb)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
        [JSON.stringify(dump.settings)]
      );
    }

    await client.query('COMMIT');
    res.json({
      ok: true,
      imported: {
        users: dump.users?.length ?? 0,
        ads: dump.ads?.length ?? 0,
        categories: dump.categories?.length ?? 0,
        cities: dump.cities?.length ?? 0,
        banners: dump.banners?.length ?? 0,
      },
    });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'import_failed', detail: String(e) });
  } finally {
    client.release();
  }
});
