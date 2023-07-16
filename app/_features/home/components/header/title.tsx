import type Home from '@/_features/home/types/types';

export default function Title({ text }: Home.TitleProps) {
  return (
    <h1 className="text-lg font-semibold tracking-wide lg:text-xl">{text}</h1>
  );
}
