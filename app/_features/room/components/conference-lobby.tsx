import { useMemo, useCallback, useState, useEffect } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { useClientContext } from '@/_features/room/contexts/client-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import CopyOutlineIcon from '@/_shared/components/icons/copy-outline-icon';
import CheckIcon from '@/_shared/components/icons/check-icon';
import SetDisplayNameModal from '@/_features/room/components/set-display-name-modal';
import { getUserMedia } from '@/_shared/utils/get-user-media';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import { AudioOutputContext } from '@/_features/room/contexts/device-context';

type LobbyProps = {
  roomID: string;
};

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function ConferenceLobby({ roomID }: LobbyProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    active: copiedIDActive,
    setActive: setCopiedIDActive,
    setInActive: setCopiedIDInActive,
  } = useToggle(false);

  const {
    active: copiedLinkActive,
    setActive: setCopiedLinkActive,
    setInActive: setCopiedLinkInActive,
  } = useToggle(false);

  const { roomType } = useMetadataContext();

  const handleCopy = useCallback(
    async (
      text = '',
      setCopiedActive: () => void,
      setCopiedInActive: () => void
    ) => {
      const success = await copyToClipboard(text);

      if (success) {
        setCopiedActive();
        setTimeout(() => {
          setCopiedInActive();
        }, 2000);
      } else {
        alert('Failed to copy');
      }
    },
    []
  );

  const { clientID, clientName } = useClientContext();

  const openUpdateClientForm = useCallback(() => {
    document.dispatchEvent(new CustomEvent('open:set-display-name-modal'));
  }, []);

  const videoConstraints = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const selectedVideoInputId = window.sessionStorage.getItem(
      'device:selected-video-input-id'
    );

    const defaultVideoConstraints: MediaTrackConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      advanced: [
        {
          frameRate: { min: 30 },
        },
        { height: { min: 360 } },
        { width: { min: 720 } },
        { frameRate: { max: 30 } },
        { width: { max: 1280 } },
        { height: { max: 720 } },
        { aspectRatio: { exact: 1.77778 } },
      ],
    };

    if (selectedVideoInputId) {
      defaultVideoConstraints['deviceId'] = { exact: selectedVideoInputId };
    }

    return defaultVideoConstraints;
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
    if (!isSubmitting) {
      setIsSubmitting(true);

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

        document.dispatchEvent(
          new CustomEvent('set:conference-view', {
            detail: {
              view: 'conference',
            },
          })
        );

        Mixpanel.track('Join room', {
          roomID: roomID,
        });

        document.dispatchEvent(
          new CustomEvent('trigger:client-join', {
            detail: { joinTime: Date.now() },
          })
        );

        setIsSubmitting(false);
      } catch (error) {
        setIsSubmitting(false);

        if (error instanceof Error) {
          console.error(error);
          alert(error.message);
        }
      }
    }
  }, [videoConstraints, audioConstraints, roomID, isSubmitting]);

  const isError = !clientID || !clientName;

  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isError]);

  return (
    <>
      <SetDisplayNameModal roomID={roomID} />
      <div className="min-viewport-height">
        <div className="min-viewport-height mx-auto flex w-full max-w-xl flex-col gap-2 px-4">
          <Header logoText="inLive Room" logoHref="/" />
          <main className="flex flex-1 flex-col gap-12 md:pt-6">
            {/* Room Info Card */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-3 md:p-4">
              <div>
                <div className="flex items-center justify-between">
                  <b className="block text-xs font-semibold uppercase text-zinc-500">
                    Room ID
                  </b>
                  {roomType === 'event' && (
                    <b className="rounded bg-zinc-800 px-3 py-1 text-xs font-medium  text-zinc-400">
                      Webinar room
                    </b>
                  )}
                  {roomType === 'meeting' && (
                    <b className="rounded bg-zinc-800 px-3 py-1 text-xs font-medium  text-zinc-400">
                      Meeting room
                    </b>
                  )}
                </div>
                <b className="block text-xl font-bold lg:text-2xl">{roomID}</b>
              </div>
              <p className="mt-3 text-sm text-zinc-400 ">
                Copy and share to invite and start joining with others in this
                room
              </p>
              <div className="mt-4 flex gap-3 md:gap-4">
                <div className="flex-1">
                  <Button
                    className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
                    onClick={() =>
                      handleCopy(roomID, setCopiedIDActive, setCopiedIDInActive)
                    }
                  >
                    <span>
                      {copiedIDActive ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <CopyOutlineIcon className="h-5 w-5" />
                      )}
                    </span>
                    <span>{copiedIDActive ? 'Copied!' : 'Copy ID'}</span>
                  </Button>
                </div>

                <div className="flex-1">
                  <Button
                    className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
                    onClick={() =>
                      handleCopy(
                        `${APP_ORIGIN}/rooms/${roomID}`,
                        setCopiedLinkActive,
                        setCopiedLinkInActive
                      )
                    }
                  >
                    <span>
                      {copiedLinkActive ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <CopyOutlineIcon className="h-5 w-5" />
                      )}
                    </span>
                    <span>{copiedLinkActive ? 'Copied!' : 'Copy link'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs font-light text-blue-300 md:text-sm">
                Make sure to allow access permissions to the camera and
                microphone in the browser.
              </p>
              <p className="mt-4 text-xs font-light text-blue-300 md:text-sm">
                You can edit your name to be easily recognized by other
                participants in this room.
              </p>
            </div>

            {/* Name Display */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex-1 truncate">
                  <div className="block w-full text-xs font-semibold text-zinc-500">
                    You’ll join using name
                  </div>
                  <div className="mt-1 truncate text-sm font-medium">
                    {clientName}
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    className="flex h-9 min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
                    onClick={openUpdateClientForm}
                  >
                    Edit name
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <div className="fixed bottom-0 left-0 flex w-full flex-col gap-2 border-t border-zinc-800 bg-zinc-900 py-2.5 lg:relative lg:border-t-0">
                {/* Preparing Room Message */}
                {isError && (
                  <div className="mx-auto w-full max-w-xl px-4 lg:px-0">
                    <div className="flex gap-4 rounded-lg bg-zinc-950 p-4">
                      <Spinner size={'md'} />
                      <p className="text-sm">
                        {`Preparing room, please wait. This page is auto-refresh when ready.`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="mx-auto w-full max-w-xl px-4 lg:px-0">
                  <Button
                    className="w-full rounded-lg bg-red-700 px-4 py-2 font-semibold text-zinc-200 antialiased hover:bg-red-600 active:bg-red-500"
                    onClick={openConferenceRoom}
                    isDisabled={isSubmitting || isError}
                    aria-disabled={isSubmitting || isError}
                    disabled={isSubmitting || isError}
                  >
                    {isSubmitting ? (
                      <div className="flex gap-2">
                        <Spinner
                          classNames={{
                            circle1: 'border-b-zinc-200',
                            circle2: 'border-b-zinc-200',
                            wrapper: 'w-4 h-4',
                          }}
                        />
                        <span>Joining to room...</span>
                      </div>
                    ) : (
                      <span>Join to Room</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
