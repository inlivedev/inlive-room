import { customType } from 'drizzle-orm/pg-core';

export const jsonb = customType<{ data: any }>({
  dataType() {
    return 'jsonb';
  },
  toDriver(val) {
    return val as any;
  },
  fromDriver(value) {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as any;
      } catch {}
    }
    return value as any;
  },
});

export default jsonb;
