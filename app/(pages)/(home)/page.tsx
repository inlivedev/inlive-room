import HomeHeader from '@/_features/home/components/header';
import HomeFooter from '@/_features/home/components/footer';
import HomeJoin from '@/_features/home/components/join';
import HomeCTA from '@/_features/home/components/cta';

export default function Page() {
  return (
    <div className=" flex min-h-screen flex-col gap-10 bg-neutral-900 text-neutral-200">
      <HomeHeader />
      <div className="mx-auto flex max-w-5xl flex-1 flex-col justify-center">
        <div className="flex w-full flex-col gap-20 px-4 lg:flex-row">
          <div>
            <HomeCTA />
          </div>
          <div className="flex-1">
            <HomeJoin />
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}
