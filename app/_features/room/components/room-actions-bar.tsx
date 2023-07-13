'use client';

import { useRouter } from 'next/navigation';
import { leaveRoom } from '@/_features/room/modules/factory';
import type { Room } from '@/_features/room/modules/room';

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
      if (!room || !clientId) return;
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

  return (
    <div className="flex justify-center p-4">
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
  );
}
