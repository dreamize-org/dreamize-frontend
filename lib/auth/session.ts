import type { BaseUser } from '@/types';

/** Normalize Mongo/ObjectId/populated refs to a plain string id. */
export function normalizeId(id: unknown): string {
  if (id == null || id === '') return '';

  if (typeof id === 'string') return id;
  if (typeof id === 'number') return String(id);

  if (typeof id === 'object') {
    const record = id as Record<string, unknown>;

    // Prefer hex toString before `_id` — avoids infinite loops on ObjectId-like values.
    if (typeof record.toString === 'function') {
      const asString = (record as { toString: () => string }).toString();
      if (/^[a-f0-9]{24}$/i.test(asString)) {
        return asString;
      }
    }

    if (typeof record.$oid === 'string') {
      return record.$oid;
    }

    if (typeof record.id === 'string' || typeof record.id === 'number') {
      return String(record.id);
    }

    if (record._id != null && record._id !== id) {
      return normalizeId(record._id);
    }
  }

  return '';
}

export function getTokenUserId(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))) as {
      userId?: string;
    };

    return payload.userId ? normalizeId(payload.userId) : null;
  } catch {
    return null;
  }
}

/** Prefer JWT userId so chat aligns with what the API/socket use as senderId. */
export function getAuthUserId(user?: Pick<BaseUser, '_id'> | null): string {
  return getTokenUserId() || normalizeId(user?._id) || normalizeId((user as { id?: string } | null)?.id);
}
