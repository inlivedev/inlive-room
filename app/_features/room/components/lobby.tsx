import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import InviteBox from '@/_features/room/components/invite-box';
import { getUserMedia } from '@/_shared/utils/get-user-media';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import { AudioOutputContext } from '@/_features/room/contexts/device-context';
import type { ClientType } from '@/_shared/types/client';

type LobbyProps = {
  roomID: string;
  client: ClientType.ClientData;
};

export default function Lobby({ roomID, client }: LobbyProps) {
  const videoConstraints = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const selectedVideoInputId = window.sessionStorage.getItem(
      'device:selected-video-input-id'
    );

    if (selectedVideoInputId) {
      return { deviceId: { exact: selectedVideoInputId } };
    }

    return {
      width: {
        ideal: 1280,
      },
      height: {
        ideal: 720,
      },
    };
  }, []);

  const audioConstraints = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const selectedAudioInputId = window.sessionStorage.getItem(
      'device:selected-audio-input-id'
    );

    const defaultConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    if (selectedAudioInputId) {
      return {
        deviceId: { exact: selectedAudioInputId },
        ...defaultConstraints,
      };
    }

    return defaultConstraints;
  }, []);

  const openConferenceRoom = useCallback(async () => {
    try {
      const resumeAudioContextPromise = new Promise<null>(async (resolve) => {
        if (AudioOutputContext && AudioOutputContext.state === 'suspended') {
          await AudioOutputContext.resume();
        }

        return resolve(null);
      });

      const mediaStreamPromise = navigator.mediaDevices
        .enumerateDevices()
        .then(async (devices) => {
          const videoInput = devices.find(
            (device) => device.kind === 'videoinput'
          );
          const audioInput = devices.find(
            (device) => device.kind === 'audioinput'
          );

          if (!audioInput) {
            throw new Error(
              'Your device needs to have an active microphone in order to continue'
            );
          }

          const mediaStream = await getUserMedia({
            video: videoInput ? videoConstraints : false,
            audio: audioConstraints,
          });

          return mediaStream;
        });

      const [mediaStream] = await Promise.all([
        mediaStreamPromise,
        resumeAudioContextPromise,
      ]);

      document.dispatchEvent(
        new CustomEvent('turnon:media-input', {
          detail: {
            mediaInput: mediaStream,
          },
        })
      );

      Mixpanel.track('Join room', {
        roomID: roomID,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        alert(error.message);
      }
    }
  }, [videoConstraints, audioConstraints, roomID]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-4">
        <Header />
        <main className="flex flex-1 flex-col">
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-tight text-zinc-400">
                Room ID
              </h2>
              <b className="block text-2xl font-bold">{roomID}</b>
            </div>
            <div>
              <h3 className="font-medium">You are about to enter this room</h3>
              <p className="mt-0.5 text-sm text-zinc-400">
                Anyone with the link or room ID can enter this room. Make sure
                your device camera and microphone are working properly.
              </p>
            </div>
            <div>
              <label
                htmlFor="display-name-readonly"
                className="mb-3 inline-block text-sm font-medium"
              >
                Your display name
              </label>
              <input
                id="display-name-readonly"
                className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
                type="text"
                placeholder="Your real name or nickname"
                readOnly
                defaultValue={client.name}
              />
              <p className="mt-3 text-xs text-zinc-400">
                Other participants can easily recognize you by your display name
              </p>
            </div>
            <div>
              <InviteBox roomID={roomID} />
            </div>
            <div className="flex flex-row flex-wrap justify-center gap-x-8 gap-y-6">
              <div className="flex-1">
                <Button
                  as={Link}
                  href="/"
                  variant="flat"
                  className="w-full min-w-[240px] rounded-md  bg-zinc-800 px-4  py-2 text-sm text-zinc-200 hover:bg-zinc-700 active:bg-zinc-600"
                >
                  Back to front page
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  variant="flat"
                  className="w-full min-w-[240px] rounded-md bg-red-700 px-4 py-2 text-sm text-zinc-200 hover:bg-red-600 active:bg-red-500 lg:w-auto"
                  onClick={openConferenceRoom}
                >
                  Enter this room
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
