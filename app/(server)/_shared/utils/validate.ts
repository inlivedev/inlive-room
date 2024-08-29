import { z } from 'zod';

export const parseValidDate = z
  .string()
  .datetime({ offset: true })
  .pipe(z.coerce.date());
