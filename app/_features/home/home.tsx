'use client';
import Header from '@/_shared/components/header/header';
import CreateRoom from '@/_features/home/create-room';
import JoinRoom from '@/_features/home/join-room';
import Footer from '@/_shared/components/footer/footer';
import { whitelistFeature } from '@/_shared/utils/flag';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useToggle } from '@/_shared/hooks/use-toggle';

const WebinarBetaAlert = () => {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-blue-900/25 p-5 text-sm text-blue-300">
      <p className="text-pretty">
        Heads up! The webinar feature is currently in beta with limited early
        access.
      </p>
      <p className="mt-5 text-pretty">
        Be among the first to try it! Earn your access by attend webinars for a
        total of 60 minutes, it can be spread across multiple sessions. Just
        remember to log in first before attending.
      </p>
    </div>
  );
};

export default function View() {
  const { user } = useAuthContext();
  const { active: webinarAlertActive, setActive: setWebinarAlertActive } =
    useToggle(false);

  return (
    <div className="bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-5xl flex-1 flex-col  px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex flex-1 flex-col justify-center">
          <div className="flex w-full flex-col gap-10 py-10 md:flex-row md:py-20 lg:gap-20">
            <div>
              <CreateRoom setWebinarAlertActive={setWebinarAlertActive} />
              {!whitelistFeature.includes('event') &&
                !user?.whitelistFeature.includes('event') &&
                webinarAlertActive && (
                  <div className="mt-10 block md:hidden">
                    <WebinarBetaAlert />
                  </div>
                )}
            </div>
            <div className="mx-auto w-full max-w-[400px] md:max-w-[360px] lg:max-w-[400px]">
              <JoinRoom />
            </div>
          </div>
          {!whitelistFeature.includes('event') &&
            !user?.whitelistFeature.includes('event') &&
            webinarAlertActive && (
              <div className="hidden md:block">
                <WebinarBetaAlert />
              </div>
            )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
