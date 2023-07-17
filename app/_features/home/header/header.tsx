export default function Header() {
  return (
    <header className="py-6 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-center gap-2 px-4">
          <Icon />
          <Title text="inLive Room" />
        </div>
      </div>
    </header>
  );
}

function Title({ text }: { text: string }) {
  return (
    <h1 className="text-lg font-semibold tracking-wide lg:text-xl">{text}</h1>
  );
}

function Icon() {
  return (
    <svg
      className="h-6 w-6 lg:h-7 lg:w-7"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 48.5814C41.1577 48.5814 48.5815 41.1576 48.5815 31.9999C48.5815 22.8422 41.1577 15.4184 32 15.4184C22.8423 15.4184 15.4185 22.8422 15.4185 31.9999C15.4185 41.1576 22.8423 48.5814 32 48.5814Z"
        fill="#C42323"
      />
      <path
        d="M32 55.9999C45.2548 55.9999 56 45.2548 56 32C56 18.7451 45.2548 8 32 8C18.7452 8 8 18.7451 8 32C8 45.2548 18.7452 55.9999 32 55.9999Z"
        stroke="#C42323"
        strokeWidth="1.4452"
        strokeMiterlimit="10"
      />
    </svg>
  );
}
