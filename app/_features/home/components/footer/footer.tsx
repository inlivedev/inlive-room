import LearnMore from './learn-more';
import Separator from './separator';
import Copyright from './copyright';
import type Home from '@/_features/home/types/types';

export default function Footer({ children }: Home.FooterProps) {
  return (
    <footer className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6 lg:max-w-5xl lg:py-8">
      {children}
    </footer>
  );
}

Footer.LearnMore = LearnMore;
Footer.Separator = Separator;
Footer.Copyright = Copyright;
