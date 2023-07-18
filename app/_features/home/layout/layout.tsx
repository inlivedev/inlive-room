import Header from '@/_features/home/header';
import CreateRoom from '@/_features/home/create-room';
import JoinRoom from '@/_features/home/join-room';
import Footer from '@/_features/home/footer';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col gap-10 bg-neutral-900 text-neutral-200">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center">
        <div className="flex w-full flex-col gap-20 px-4 lg:flex-row">
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
  );
}
