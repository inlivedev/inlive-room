'use client';

import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Link from 'next/link';

type EventRegistrationSuccessProps = {
  participantName: string;
  title: string;
  startTime: Date;
  slug: string;
};

export default function EventRegistrationSuccess({
  participantName,
  title,
  startTime,
  slug,
}: EventRegistrationSuccessProps) {
  const eventStartDate = new Date(startTime).toLocaleDateString('en-GB', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  const eventStartTime = new Date(startTime).toLocaleTimeString('en-GB', {
    minute: '2-digit',
    hour: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-viewport-height bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
        <Header logoText="inLive Event" logoHref="/event" />
        <main className="mb-10 flex flex-1 flex-col gap-8 lg:gap-28">
          <div className="flex flex-col lg:order-2 lg:flex-row lg:gap-10">
            <div className="flex justify-center">
              <RegistrationSuccessIllustration />
            </div>
            <div className="mx-auto max-w-[640px]">
              <h2 className="mt-8 text-2xl font-bold text-zinc-100 lg:text-3xl">
                You’re in! Get ready to join.
              </h2>
              <div className="text-sm lg:text-base">
                <p className="mt-4">Congratulations, {participantName}! 🎉</p>
                <p className="mt-4">
                  You&#39;re successfully registered to this event:
                  <br />
                  <b className="font-semibold">{title}</b>
                </p>
                <p className="mt-4">
                  And don’t forget to mark your calendar at:
                  <br />
                  <b className="font-semibold">
                    {eventStartDate}, {eventStartTime}
                  </b>
                </p>
                <p className="mt-4">
                  We&#39;ve sent you an invitation email with all the details
                  you need to know. Check your inbox, or if you can&#39;t find
                  it, take a peek in your spam folder.
                </p>
                <p className="mt-4">
                  In the meantime, spread the word and invite your friends to
                  join with you!
                  <br />
                  The more, the merrier.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-left">
            <Button
              as={Link}
              href={`/event/${slug}`}
              variant="flat"
              className="rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-zinc-700 active:bg-zinc-600"
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    fill="currentColor"
                    d="M10.295 19.715a1 1 0 0 0 1.404-1.424l-5.37-5.292h13.67a1 1 0 0 0 0-2H6.336L11.7 5.714a1 1 0 0 0-1.404-1.424L3.37 11.112a1.25 1.25 0 0 0 0 1.78l6.924 6.823Z"
                  />
                </svg>
              </span>
              <span>Back to event page</span>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

const RegistrationSuccessIllustration = () => {
  return (
    <svg
      className="w-[280px] lg:w-[520px]"
      viewBox="0 0 280 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M205.258 85.2981C201.454 88.6735 197.474 92.2064 194.647 91.3422C191.82 90.4779 190.496 85.3231 189.23 80.3981C189.096 79.8758 188.962 79.356 188.828 78.8443C188.226 76.5546 187.809 73.1993 187.621 71.4747C182.405 69.5481 177.181 67.4001 171.859 65.003C169.576 63.9744 167.206 62.0911 166.063 60.0167C164.931 57.9607 164.623 54.9833 164.976 52.5239C167.115 37.6021 170.864 25.3396 177.435 11.7723C178.518 9.53613 180.438 7.24004 182.526 6.1688C184.634 5.08797 187.652 4.85187 190.12 5.276C210.335 8.74985 227.826 14.0974 246.528 22.5217C248.811 23.5503 251.181 25.4336 252.324 27.508C253.456 29.564 253.764 32.5414 253.412 35.0008C251.272 49.9226 247.523 62.1851 240.953 75.7523C239.87 77.9886 237.949 80.2846 235.861 81.3559C233.754 82.4367 230.736 82.6728 228.268 82.2487C222.515 81.2602 216.984 80.12 211.582 78.8004"
        stroke="#E4E4E7"
        strokeWidth="2.15385"
        strokeLinecap="round"
      />
      <path
        d="M195.768 42.0011L200.331 54.5941C202.577 50.295 210.786 40.1301 225.662 33.8634"
        stroke="#DC2626"
        strokeWidth="8.29231"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6431 97.4839L70.1522 23.1172L153.851 67.2568L172.183 153.503L29.9753 183.73L11.6431 97.4839Z"
        fill="#27272A"
        stroke="#E4E4E7"
        strokeWidth="2.15385"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.731 54.903L130.97 30.8333L157.699 156.582L44.4596 180.651L17.731 54.903Z"
        fill="#18181B"
      />
      <path
        d="M31.3018 63.7165L122.157 44.4047L126.075 62.839L35.2201 82.1508L31.3018 63.7165Z"
        fill="#DC2626"
      />
      <path
        d="M121.871 75.4305L44.1831 91.9435"
        stroke="#E4E4E7"
        strokeWidth="2.15385"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M79.9992 95.3405L46.4224 102.477"
        stroke="#E4E4E7"
        strokeWidth="2.15385"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M144.335 93.7074L130.97 30.8333L17.731 54.903L24.4131 86.3401"
        stroke="#E4E4E7"
        strokeWidth="2.15385"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6431 97.484L91.4232 123.189L153.851 67.2568L172.183 153.503L29.9753 183.73L11.6431 97.484Z"
        fill="#18181B"
        stroke="#E4E4E7"
        strokeWidth="2.15385"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M59.5801 148.193L89.1845 112.655L130.684 133.079L59.5801 148.193Z"
        fill="#18181B"
      />
      <path
        d="M29.9751 183.73L89.184 112.655L151.433 143.291"
        stroke="#E4E4E7"
        strokeWidth="2.15385"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
