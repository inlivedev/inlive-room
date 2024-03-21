import { useState, useEffect } from 'react';

export const useFormattedDateTime = (
  date: Date,
  locales: string | string[] | undefined,
  options: Intl.DateTimeFormatOptions | undefined
) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const formatted = new Intl.DateTimeFormat(locales, options).format(
      new Date(date)
    );
    setFormattedDate(formatted);
  }, [date, locales, options]);

  return formattedDate;
};
