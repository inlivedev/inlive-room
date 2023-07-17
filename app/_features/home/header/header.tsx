import Title from '@/_features/home/header/title';
import Icon from '@/_features/home/header/icon';

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="py-6 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-center gap-2 px-4">
          {children}
        </div>
      </div>
    </header>
  );
}

Header.Title = Title;
Header.Icon = Icon;
