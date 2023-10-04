import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import LobbyRegistration from '@/_features/room/components/lobby-registration';
import LobbyEntrance from '@/_features/room/components/lobby-entrance';

export default function Lobby({
  pageId,
  origin,
}: {
  pageId: string;
  origin: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-4">
        <Header />
        <main className="flex flex-1 flex-col">
          <LobbyRegistration pageId={pageId} />
          <LobbyEntrance pageId={pageId} origin={origin} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
