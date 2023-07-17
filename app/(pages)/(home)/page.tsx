import type { Metadata } from 'next';
import Home from '@/_features/home/layout';

export const metadata: Metadata = {
  title: 'inLive Room',
  description: 'Conference room for real-time video and audio calls',
};

export default function Page() {
  return <Home />;
}
