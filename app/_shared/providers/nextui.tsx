'use client';

import type { ComponentProps } from 'react';
import { HeroUIProvider as NextUIClientProvider } from "@heroui/react";

export default function HeroUIProvider({
  children,
  ...otherProps
}: ComponentProps<typeof NextUIClientProvider>) {
  return (
    <NextUIClientProvider {...otherProps}>{children}</NextUIClientProvider>
  );
}
