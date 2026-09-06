/** Map DB rows ↔ SPA domain shapes (camelCase). */

export function mapUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    city: row.city ?? undefined,
    role: row.role,
    avatar: row.avatar ?? undefined,
    accountStatus: row.account_status,
    createdAt: row.created_at ? new Date(row.created_at as string).getTime() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at as string).getTime() : undefined,
    phoneVerifiedAt: row.phone_verified_at
      ? new Date(row.phone_verified_at as string).getTime()
      : undefined,
    deletionRequestedAt: row.deletion_requested_at
      ? new Date(row.deletion_requested_at as string).getTime()
      : undefined,
    deletionScheduledAt: row.deletion_scheduled_at
      ? new Date(row.deletion_scheduled_at as string).getTime()
      : undefined,
    deletionCancelledAt: row.deletion_cancelled_at
      ? new Date(row.deletion_cancelled_at as string).getTime()
      : undefined,
    deletedAt: row.deleted_at ? new Date(row.deleted_at as string).getTime() : undefined,
    anonymizedAt: row.anonymized_at ? new Date(row.anonymized_at as string).getTime() : undefined,
    deletionReason: row.deletion_reason ?? undefined,
    deletionReasonDetails: row.deletion_reason_details ?? undefined,
    deactivatedAt: row.deactivated_at ? new Date(row.deactivated_at as string).getTime() : undefined,
    bannedAt: row.banned_at ? new Date(row.banned_at as string).getTime() : undefined,
    banReason: row.ban_reason ?? undefined,
    suspendedAt: row.suspended_at ? new Date(row.suspended_at as string).getTime() : undefined,
    suspensionReason: row.suspension_reason ?? undefined,
    savedAdIds: Array.isArray(row.saved_ad_ids) ? row.saved_ad_ids : [],
  };
}

export function mapAd(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    isNegotiable: row.is_negotiable,
    isFree: row.is_free,
    isUrgent: row.is_urgent,
    isPromoted: row.is_promoted,
    condition: row.condition ?? undefined,
    city: row.city,
    state: row.state ?? undefined,
    district: row.district ?? undefined,
    categoryId: row.category_id,
    subCategoryId: row.sub_category_id ?? undefined,
    images: Array.isArray(row.images) ? row.images : [],
    status: row.status,
    createdAt: new Date(row.created_at as string).getTime(),
    expiresAt: row.expires_at ? new Date(row.expires_at as string).getTime() : undefined,
    contactPhone: row.contact_phone,
    showPhone: row.show_phone,
    allowWhatsapp: row.allow_whatsapp,
    telegramId: row.telegram_id ?? undefined,
    showTelegram: row.show_telegram,
    rejectionReason: row.rejection_reason ?? undefined,
    removalReason: row.removal_reason ?? undefined,
    removedAt: row.removed_at ? new Date(row.removed_at as string).getTime() : undefined,
    removedBy: row.removed_by ?? undefined,
    soldFeedback: row.sold_feedback ?? undefined,
    viewsCount: Number(row.views_count || 0),
    isVerifiedSeller: row.is_verified_seller,
    attributes: row.attributes ?? undefined,
    previousStatus: row.previous_status ?? undefined,
    archivedAt: row.archived_at ? new Date(row.archived_at as string).getTime() : undefined,
    deletionReason: row.deletion_reason ?? undefined,
  };
}

export function mapCategory(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    isActive: row.is_active,
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
  };
}

export function mapCity(row: Record<string, unknown>) {
  return {
    name: row.name,
    isActive: row.is_active,
  };
}

export function mapBanner(row: Record<string, unknown>) {
  return {
    id: row.id,
    imageUrl: row.image_url,
    title: row.title ?? undefined,
    link: row.link ?? undefined,
    position: row.position,
    altText: row.alt_text ?? undefined,
    isActive: row.is_active,
  };
}

export function mapNotification(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? undefined,
    message: row.message,
    type: row.type,
    isRead: row.is_read,
    createdAt: new Date(row.created_at as string).getTime(),
    link: row.link ?? undefined,
    category: row.category ?? undefined,
  };
}

export const ts = (ms?: number | null) =>
  ms == null ? null : new Date(ms).toISOString();
