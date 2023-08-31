import type { SVGElementPropsType } from '@/_shared/types/types';

export default function CameraOffIcon(props: SVGElementPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentcolor"
      viewBox="0 0 256 256"
      {...props}
    >
      <path d="M213.92,210.62a8,8,0,1,1-11.84,10.76L182.64,200H32a16,16,0,0,1-16-16V72A16,16,0,0,1,32,56H51.73L42.08,45.38A8,8,0,1,1,53.92,34.62ZM251.77,73a8,8,0,0,0-8.21.39l-32,21.34a8,8,0,0,0-3.56,6.65v53.34a8,8,0,0,0,3.56,6.65l32,21.34A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73Zm-73.69,74.46A8,8,0,0,0,192,142V72a16,16,0,0,0-16-16H113.06a8,8,0,0,0-5.92,13.38Z"></path>
    </svg>
  );
}
