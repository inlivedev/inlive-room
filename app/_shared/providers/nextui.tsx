'use client';

import type { ComponentProps } from 'react';
import { NextUIProvider as NextUIClientProvider } from '@nextui-org/react';

export default function NextUIProvider({
  children,
  ...otherProps
}: ComponentProps<typeof NextUIClientProvider>) {
  return (
    <NextUIClientProvider {...otherProps}>{children}</NextUIClientProvider>
  );
}
