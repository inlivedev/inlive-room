import { useMemo } from 'react';

export const useFormattedDate = (
  date: Date,
  locales: string | string[] | undefined,
  options: Intl.DateTimeFormatOptions | undefined
) => {
  const formattedDate = useMemo(
    () => new Intl.DateTimeFormat(locales, options).format(new Date(date)),
    [date, locales, options]
  );

  return formattedDate;
};
