import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';

type LobbyProps = {
  children: React.ReactNode;
};

export default function Lobby({ children }: LobbyProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-4">
        <Header />
        <main className="flex flex-1 flex-col justify-center">
          <div className="flex w-full max-w-xl flex-col">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
