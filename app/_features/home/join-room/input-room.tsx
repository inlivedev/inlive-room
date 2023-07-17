export default function Input({
  ...props
}): React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>> {
  return (
    <input
      className="flex-1 rounded-md border border-neutral-600 bg-neutral-800 px-4 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
      {...props}
    />
  );
}
