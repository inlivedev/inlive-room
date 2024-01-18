import Header from '@/_shared/components/header/header';
import CreateRoom from '@/_features/home/create-room';
import JoinRoom from '@/_features/home/join-room';
import Footer from '@/_shared/components/footer/footer';

export default function View() {
  return (
    <div className="min-viewport-height bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex flex-1 flex-col justify-center">
          <div className="flex w-full flex-col gap-20 md:flex-row md:gap-10 lg:gap-20">
            <div>
              <CreateRoom />
            </div>
            <div className="mx-auto w-full max-w-[400px] md:max-w-[360px] lg:max-w-[400px]">
              <JoinRoom />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
