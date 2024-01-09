import { Cropper, ReactCropperElement } from 'react-cropper';
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import {
  Dispatch,
  SetStateAction,
  useState,
  createRef,
  useCallback,
  useEffect,
} from 'react';

interface ImageCropperModalProps {
  setImage: Dispatch<SetStateAction<Blob | null>>;
  setImagePreview: Dispatch<SetStateAction<string | null>>;
  imagePreview: string | null;
}

export function ImageCropperModal({
  setImage,
  setImagePreview,
  imagePreview,
}: ImageCropperModalProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [imageCandidate, setImageCandidate] = useState<Blob | null>(null);
  const cropperRef = createRef<ReactCropperElement>();

  const getCropData = useCallback(() => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      console.log('getCropData...');
      if (!cropperRef.current) console.log('cropperRef.current is undefined');
      cropperRef.current?.cropper.getCroppedCanvas().toBlob(
        (blob) => {
          if (blob) {
            setImageCandidate(blob);
          }
        },
        'image/jpeg',
        1
      );
    }
  }, [cropperRef]);

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    document.addEventListener('open:image-cropper', openModal);
  });

  const onCancel = useCallback(() => {
    setImageCandidate(null);
    setImage(null);
    setImagePreview(null);
    onClose();
  }, [onClose, setImage, setImagePreview]);

  const onConfirm = useCallback(() => {
    console.log('onConfirm...');
    console.log(imageCandidate);
    getCropData();
    console.log(imageCandidate);

    if (imageCandidate) {
      setImage(imageCandidate);
      setImagePreview(
        URL.createObjectURL(
          new File([imageCandidate], 'image', { type: 'image/jpeg' })
        )
      );
    }

    onClose();
  }, [getCropData, imageCandidate, onClose, setImage, setImagePreview]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      placement="auto"
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader>Adjusting image</ModalHeader>
        <ModalBody className="w-fill">
          {imagePreview ? (
            <Cropper
              ref={cropperRef}
              src={imagePreview}
              style={{ minWidth: 200, minHeight: 100, aspectRatio: '2/1' }}
              aspectRatio={2 / 1}
              checkOrientation={false}
              viewMode={2}
              dragMode="move"
              minCanvasWidth={200}
              minCropBoxWidth={200}
              background={false}
            ></Cropper>
          ) : (
            <p>Failed to load Image</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button className="rounded-md px-4 py-2 text-sm" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            className="rounded-md bg-red-800 px-4  py-2 text-sm hover:bg-red-500 active:bg-red-600"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
