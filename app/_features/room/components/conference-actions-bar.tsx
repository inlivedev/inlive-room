import ButtonLeave from '@/_features/room/components/button-leave';

export default function ConferenceActionsBar() {
  return (
    <div className="flex justify-center gap-3">
      <div>
        <ButtonLeave />
      </div>
    </div>
  );
}
