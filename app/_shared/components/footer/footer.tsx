export default function Footer() {
  return (
    <footer className="flex flex-col gap-5 py-5 md:py-10">
      <hr className="border-t border-zinc-700" />
      <div className="mx-auto inline-flex flex-col items-center text-xs text-zinc-400 md:flex-row">
        <a
          href="https://inlive.app/"
          target="_blank"
          className="underline-offset-4 hover:underline"
        >
          <span>&copy; {new Date().getFullYear()}&nbsp;</span>
          <span>inLive</span>
        </a>
        <span className="hidden md:inline">&ensp;•&ensp;</span>
        <div className="mt-2 inline-flex md:mt-0">
          <a
            href="https://github.com/inlivedev/inlive-room/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            View code on GitHub
          </a>
          <span>&ensp;•&ensp;</span>
          <a
            href="https://twitter.com/inliveapp/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Follow for updates
          </a>
        </div>
      </div>
    </footer>
  );
}
