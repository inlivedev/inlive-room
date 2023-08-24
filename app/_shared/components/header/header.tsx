import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full py-6 lg:py-8">
      <div className="flex items-center justify-center gap-2 px-4">
        <Image
          src="/images/favicon/favicon.svg"
          alt="Icon Logo"
          className="h-6 w-6 lg:h-7 lg:w-7"
          width={28}
          height={28}
        />
        <Title text="inLive Room" />
      </div>
    </header>
  );
}

function Title({ text }: { text: string }) {
  return (
    <h1 className="text-lg font-semibold tracking-wide lg:text-xl">{text}</h1>
  );
}
