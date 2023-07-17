type ButtonProps = {
  handleCreateRoom: () => void;
  text: string;
};

export default function CreateButton({ handleCreateRoom, text }: ButtonProps) {
  return (
    <button
      className="w-full rounded-md border border-red-700 bg-red-700 px-6 py-2 text-sm font-medium lg:w-auto"
      onClick={() => handleCreateRoom()}
    >
      {text}
    </button>
  );
}
