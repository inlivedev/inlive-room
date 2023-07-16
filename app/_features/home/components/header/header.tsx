import Title from './title';
import Icon from './icon';
import type Home from '@/_features/home/types/types';

export default function Header({ children }: Home.HeaderProps) {
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
