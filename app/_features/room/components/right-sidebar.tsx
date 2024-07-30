'use client';

export default function RightSidebar({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return isOpen ? (
    <div className="fixed inset-0 z-50 h-full w-full bg-zinc-50 sm:absolute sm:inset-auto sm:right-0 sm:max-w-[360px] sm:rounded-xl">
      {children}
    </div>
  ) : null;
}
