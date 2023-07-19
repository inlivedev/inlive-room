'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { leaveRoom } from '@/_features/room/modules/factory';
import { Room } from '@/_features/room/modules/room';
import { MediaManager } from '@/_features/room/modules/media';
import { useToggle } from '@/_shared/hooks/use-toggle';

type RoomActionsBarProps = {
  room: Room | null;
  roomId: string;
  clientId: string;
};

export default function RoomActionsBar({
  roomId,
  clientId,
  room,
}: RoomActionsBarProps) {
  const router = useRouter();

  const handleLeaveRoom = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    try {
      if (!room || !roomId || !clientId) return;

      room.disconnect();
      const leave = await leaveRoom(roomId, clientId);

      if (leave.code >= 300) {
        throw new Error('Failed to end the conversation');
      }

      router.push(`/`);
      router.refresh();
    } catch (error) {
      alert('Something went wrong. Please try again later! ');
      console.error(error);
    }
  };

  const handleScreenSharing = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    try {
      if (!room || !roomId || !clientId) return;

      const stream = await MediaManager.getDisplayMedia({
        audio: true,
        video: true,
      });

      room.addStream(stream, 'local');

      for (const track of stream.getTracks()) {
        const sender = room.getPeerConnection()?.addTrack(track, stream);

        track.onended = () => {
          room.removeLocalStream(stream);
          if (!sender) return;
          room.getPeerConnection()?.removeTrack(sender);
        };
      }
    } catch (error) {
      alert('Something went wrong. Please try again!');
    }
  };

  const { active: activeCamera, toggle: toggleCamera } = useToggle(true);
  const { active: activeMic, toggle: toggleMic } = useToggle(true);

  useEffect(() => {
    if (!room) return;

    if (activeCamera) {
      room.turnOnCamera();
    } else {
      room.turnOffCamera();
    }
  }, [room, activeCamera]);

  useEffect(() => {
    if (!room) return;

    if (activeMic) {
      room.turnOnMic();
    } else {
      room.turnOffMic();
    }
  }, [room, activeMic]);

  return (
    <div className="flex justify-center gap-3 p-4">
      <div>
        <button
          className={`rounded-full ${
            activeCamera ? 'bg-neutral-700' : 'bg-red-500'
          } p-3 text-neutral-50`}
          aria-label="Toggle Video Camera"
          onClick={toggleCamera}
        >
          {activeCamera ? <VideoCameraOnIcon /> : <VideoCameraOffIcon />}
        </button>
      </div>
      <div>
        <button
          className={`rounded-full ${
            activeMic ? 'bg-neutral-700' : 'bg-red-500'
          } p-3 text-neutral-50`}
          aria-label="Toggle Micropphone"
          onClick={toggleMic}
        >
          {activeMic ? <MicrophoneOnIcon /> : <MicrophoneOffIcon />}
        </button>
      </div>
      <div>
        <button
          className="rounded-full bg-neutral-700 p-3 text-neutral-50"
          aria-label="Screen share"
          onClick={handleScreenSharing}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
          >
            <path
              d="M19.75 4A2.25 2.25 0 0 1 22 6.25v11.5A2.25 2.25 0 0 1 19.75 20H4.25A2.25 2.25 0 0 1 2 17.75V6.25A2.25 2.25 0 0 1 4.25 4zM12 7.245a.75.75 0 0 0-.53.22L8.22 10.72a.75.75 0 0 0 1.06 1.06l1.97-1.972v6.445a.75.75 0 1 0 1.5 0V9.806l1.974 1.974a.75.75 0 1 0 1.06-1.06L12.53 7.465a.75.75 0 0 0-.53-.22z"
              fill="currentColor"
              fillRule="nonzero"
            />
          </svg>
        </button>
      </div>

      <div>
        <button
          className="rounded-full bg-red-500 p-3"
          aria-label="Leave room"
          onClick={handleLeaveRoom}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22.1513 16.6725C21.9529 16.9259 21.6784 17.1089 21.3681 17.1943C21.0578 17.2797 20.7282 17.2631 20.4281 17.1468L15.8344 15.5165L15.8072 15.5062C15.5775 15.4143 15.3741 15.267 15.2151 15.0774C15.0561 14.8878 14.9464 14.6619 14.896 14.4197L14.3138 11.6306C12.8033 11.1159 11.1644 11.1196 9.65627 11.6409L9.10314 14.4084C9.05436 14.6533 8.9452 14.8821 8.78559 15.0742C8.62597 15.2662 8.42093 15.4154 8.18908 15.5081L8.16189 15.5184L3.56814 17.1468C3.39762 17.214 3.21611 17.249 3.03283 17.25C2.80469 17.2504 2.57945 17.1988 2.37427 17.099C2.16909 16.9993 1.98936 16.854 1.84877 16.6743C0.233455 14.5912 0.414392 11.8265 2.28845 9.95153C7.55252 4.68559 16.4447 4.68559 21.7116 9.95153C23.5856 11.8247 23.7666 14.5893 22.1513 16.6725Z"
              fill="#FAFAFA"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function MicrophoneOnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentcolor"
      viewBox="0 0 256 256"
    >
      <path d="M80,128V64a48,48,0,0,1,96,0v64a48,48,0,0,1-96,0Zm128,0a8,8,0,0,0-16,0,64,64,0,0,1-128,0,8,8,0,0,0-16,0,80.11,80.11,0,0,0,72,79.6V232a8,8,0,0,0,16,0V207.6A80.11,80.11,0,0,0,208,128Z"></path>
    </svg>
  );
}

function MicrophoneOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentcolor"
      viewBox="0 0 256 256"
    >
      <path d="M213.38,221.92a8,8,0,0,1-11.3-.54l-26.46-29.1A79.74,79.74,0,0,1,136,207.59V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,100.79,52.36l-10.88-12A48,48,0,0,1,80,128V87.09L42.08,45.38A8,8,0,1,1,53.92,34.62l160,176A8,8,0,0,1,213.38,221.92Zm-51.3-92.11A8,8,0,0,0,176,124.43V64A48,48,0,0,0,87.16,38.78,8,8,0,0,0,88,48.37Zm30.1,31.83a8,8,0,0,0,10.36-4.55A79.62,79.62,0,0,0,208,128a8,8,0,0,0-16,0,63.71,63.71,0,0,1-4.36,23.27A8,8,0,0,0,192.18,161.64Z"></path>
    </svg>
  );
}

function VideoCameraOnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentcolor"
      viewBox="0 0 256 256"
    >
      <path d="M192,72V184a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V72A16,16,0,0,1,32,56H176A16,16,0,0,1,192,72Zm58,.25a8.23,8.23,0,0,0-6.63,1.22L209.78,95.86A4,4,0,0,0,208,99.19v57.62a4,4,0,0,0,1.78,3.33l33.78,22.52a8,8,0,0,0,8.58.19,8.33,8.33,0,0,0,3.86-7.17V80A8,8,0,0,0,250,72.25Z"></path>
    </svg>
  );
}

function VideoCameraOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentcolor"
      viewBox="0 0 256 256"
    >
      <path d="M213.92,210.62a8,8,0,1,1-11.84,10.76L182.64,200H32a16,16,0,0,1-16-16V72A16,16,0,0,1,32,56H51.73L42.08,45.38A8,8,0,1,1,53.92,34.62ZM251.77,73a8,8,0,0,0-8.21.39l-32,21.34a8,8,0,0,0-3.56,6.65v53.34a8,8,0,0,0,3.56,6.65l32,21.34A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73Zm-73.69,74.46A8,8,0,0,0,192,142V72a16,16,0,0,0-16-16H113.06a8,8,0,0,0-5.92,13.38Z"></path>
    </svg>
  );
}
