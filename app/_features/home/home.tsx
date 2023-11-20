import Header from '@/_shared/components/header/header';
import CreateRoom from '@/_features/home/create-room';
import JoinRoom from '@/_features/home/join-room';
import Footer from '@/_shared/components/footer/footer';

export default function View() {
  return (
    <div className="min-viewport-height bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4">
        <Header />
        <main className="mx-auto flex flex-1 flex-col justify-center">
          <div className="flex w-full flex-col gap-20 lg:flex-row">
            <div>
              <CreateRoom />
            </div>
            <div className="flex-1">
              <JoinRoom />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
