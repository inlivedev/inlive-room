import LearnMore from '@/_features/home/footer/learn-more';
import Separator from '@/_features/home/footer/separator';
import Copyright from '@/_features/home/footer/copyright';

export default function Footer({ children }: { children: React.ReactNode }) {
  return (
    <footer className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6 lg:max-w-5xl lg:py-8">
      {children}
    </footer>
  );
}

Footer.LearnMore = LearnMore;
Footer.Separator = Separator;
Footer.Copyright = Copyright;
