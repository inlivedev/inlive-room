type JoinButtonProps = {
  handleJoinRoom: (event: React.MouseEvent<HTMLButtonElement>) => void;
  text: string;
};

export default function JoinButton({ handleJoinRoom, text }: JoinButtonProps) {
  return (
    <button
      className="text-sm font-medium"
      onClick={(event) => handleJoinRoom(event)}
    >
      {text}
    </button>
  );
}
