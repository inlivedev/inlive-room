import { Html, Tailwind, Body, Img, Head, Font, Container, Button, Row, Column } from '@react-email/components';
import * as React from "react";


const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

const dummyEvent = {
  name: 'Meeting',
  startTime: new Date(),
  endTime: new Date(),
  host: {
    name: 'Host Name'
  },
  roomID: 'room-id',
  slug: 'Meeting'
}

type ScheduledMeetingMeta = {
  event: {
    name: string;
    startTime: Date;
    endTime: Date;
    roomID: string;
    slug: string;
  },
  host: {
    name: string;
  };
}

export default function EmailScheduledMeeting({
  event = dummyEvent,
  host = {
    name : ""
  }
}: ScheduledMeetingMeta) {
  const startDate = Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone:'Asia/Jakarta'
  }).format(event.startTime,)

  const startTime = Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone:'Asia/Jakarta'
  }).format(event.startTime,);

  const endTime = Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone:'Asia/Jakarta'

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
        <Body className=" my-auto mx-auto px-2">

          <Container className=" my-[40px] mx-auto p-[20px] max-w-[465px]">

            <section>
              <Row>
                <Column>
                  <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <Img src={`${APP_ORIGIN}/images/favicon/icon-192.png`}
                      width={24}
                      height={24}></Img>
                  </div>
                  <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <h1 className="text-lg font-semibold tracking-wide">
                      inLive Room
                    </h1>
                  </div>
                </Column>

                <Column
                  align='right'>
                  <h1 className="font-medium text-[14px]">
                    inLive Meeting Invitation
                  </h1>
                </Column>
              </Row>
            </section>

            <div>
              <h2 className=" font-semibold text-[14px] ">
                Hi there!
              </h2>
              <h2 className=' font-semibold text-[14px] '>
                {host.name} has scheduled a meeting with you.
              </h2>

              <div className='border border-solid border-zinc-800 rounded-md p-2 gap-2'>
                <div className='rounded gap-2 p-2'>


                  {event.name.trim() != '' && (
                    <div>
                      <b className="block text-[14px] font-semibold  py-4">
                        {event.name}
                      </b>
                    </div>
                  )}

                  <div className='py-2'>
                    <b className="block text-[12px] font-semibold ">
                      Hosted by
                    </b>
                    <div className="mt-0.5 block text-[10px] text-zinc-600">
                      {host?.name}
                    </div>
                  </div>

                  <div>
                    <b className="block text-[12px] font-semibold">
                      {startDate}
                    </b>
                    <div className="mt-0.5 block text-[10px] lowercase">
                      {startTime} to {endTime}
                    </div>
                  </div>

                </div>
              </div>

              <Button
                className="rounded-md bg-red-800 py-2 text-[14px] antialiase text-white w-full text-center justify-center mt-2"
                href={`${APP_ORIGIN}/rooms/${event.roomID}`}>
                Join Meeting
              </Button>

            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
