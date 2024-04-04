import { Html, Tailwind, Body, Img, Head, Font, Container, Button, Section, Row, Column } from '@react-email/components';
import { EventType } from '@/_shared/types/event';
import * as React from "react";


const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

const dummyEvent: EventType.Event = {
  id: 1,
  uuid: null,
  name: 'Dummy Event',
  slug: 'dummy-event',
  startTime: new Date(),
  endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
  createdAt: new Date(),
  updatedAt: new Date(),
  description: '',
  createdBy: null,
  roomId: null,
  thumbnailUrl: '',
  deletedAt: null,
  status: 'published',
  host: {
    name: 'Host Name',
    email: ''
  }
}

export default function EventManualInvitation({
  event = dummyEvent,
}: {
  event?: EventType.Event;
}) {
  // const eventImage = event.thumbnailUrl
  //   ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
  //   : `${APP_ORIGIN}/images/webinar/webinar-no-image-placeholder.png`;

  const eventImage = `https://dev-room.inlive.app/static/assets/images/events/26/poster.webp`

  const startDate = Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(event.startTime,)

  const startTime = Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(event.startTime,);

  const endTime = Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(event.endTime,);

  return (
    <Html lang='en'>
      <Head>
        <Font
          fontFamily="Helvetica"
          fallbackFontFamily="Verdana"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Body className="bg-zinc-900 text-zinc-100 my-auto mx-auto px-2">

          <Container className=" my-[40px] mx-auto p-[20px] max-w-[465px]">

            <section>
              <Row>
                <Column>
                  <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <Img src={`https://room.inlive.app/images/favicon/icon-192.png`}
                      width={24}
                      height={24}></Img>
                  </div>
                  <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <h1 className="text-lg font-semibold tracking-wide text-zinc-100">
                      inLive Room
                    </h1>
                  </div>
                </Column>

                <Column
                  align='right'>
                  <h1 className="font-medium text-zinc-400 text-[14px]">
                    inLive Event Invitation
                  </h1>
                </Column>
              </Row>
            </section>

            <div>
              <h2 className=" font-semibold text-[14px] text-zinc-100">
                Hi there!
              </h2>
              <h2 className=' font-semibold text-[14px] text-zinc-100'>
                You've been personally invited to the following Webinar
              </h2>

              <div className='border border-solid border-zinc-800 rounded-md p-2 gap-2'>
                <Img src={eventImage}
                  className='w-full rounded' />
                <div className='bg-zinc-950/25 rounded gap-2 p-2'>

                  <div>
                    <b className="block text-[14px] font-semibold text-zinc-100 py-4">
                      {event.name}
                    </b>
                  </div>

                  <div className='py-2'>
                    <b className="block text-[12px] font-semibold text-zinc-100">
                      Hosted by
                    </b>
                    <div className="mt-0.5 block text-[10px] text-zinc-300">
                      {event.host?.name}
                    </div>
                  </div>

                  <div>
                    <b className="block text-[12px] font-semibold text-zinc-100">
                      {startDate}
                    </b>
                    <div className="mt-0.5 block text-[10px] lowercase text-zinc-300">
                      {startTime} to {endTime}
                    </div>
                  </div>

                </div>
              </div>

              <Button
                className="rounded-md bg-red-800 py-2 text-[14px] antialiase text-zinc-100 w-full text-center justify-center mt-2"
                href={`${APP_ORIGIN}/events/${event.slug}`}>
                View Event Details
              </Button>

            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
