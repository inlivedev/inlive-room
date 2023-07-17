import Header from '@/_features/home/header';
import Main from '@/_features/home/main';
import Footer from '@/_features/home/footer';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col gap-10 bg-neutral-900 text-neutral-200">
      <Header>
        <Header.Icon />
        <Header.Title text="inLive Room" />
      </Header>
      <Main />
      <Footer>
        <Footer.LearnMore />
        <Footer.Separator />
        <Footer.Copyright />
      </Footer>
    </div>
  );
}
