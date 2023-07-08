import LogoIcon from '@/_features/home/components/logo-icon';

export default function HomeHeader() {
  return (
    <header className="py-6 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-center gap-2 px-4">
          <LogoIcon />
          <h1 className="text-lg font-semibold tracking-wide lg:text-xl">
            inLive Room
          </h1>
        </div>
      </div>
    </header>
  );
}
