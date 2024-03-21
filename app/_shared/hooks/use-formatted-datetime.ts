import { useMemo } from 'react';

export const useFormattedDateTime = (
  date: Date,
  locales: string | string[] | undefined,
  options: Intl.DateTimeFormatOptions | undefined
) => {
  const formattedDateTime = useMemo(
    () => new Intl.DateTimeFormat(locales, options).format(new Date(date)),
    [date, locales, options]
  );

  return formattedDateTime;
};
