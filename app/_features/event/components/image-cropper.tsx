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
import { Dispatch, createRef, useCallback, useEffect, useReducer } from 'react';

export interface ImageState {
  imageBlob: Blob | null;
  imagePreview: string | null;
}

export type ActionType =
  | { type: 'ConfirmCrop'; payload: { blob: Blob; preview: string } }
  | { type: 'PickFile'; payload: Blob }
  | { type: 'Reset' };
interface ImageCropperModalProps {
  updateImageData: Dispatch<ActionType>;
  imageData: ImageState;
}

export function ImageCropperModal({
  imageData,
  updateImageData,
}: ImageCropperModalProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  type candidateType =
    | { type: 'ConfirmCropCandidate'; payload: Blob }
    | { type: 'Cancel' };

  const reduceCandidate = (state: Blob | null, action: candidateType) => {
    switch (action.type) {
      case 'ConfirmCropCandidate':
        return action.payload;
      case 'Cancel':
        return null;
      default:
        return state;
    }
  };

  const [imageCandidate, updateImageCandidate] = useReducer(
    reduceCandidate,
    null
  );

  const cropperRef = createRef<ReactCropperElement>();

  const getCropData = useCallback(async () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      console.log('getCropData...');
      console.log(imageCandidate);
      if (!cropperRef.current) console.log('cropperRef.current is undefined');

      const getCanvasBlob = (
        canvas: HTMLCanvasElement
      ): Promise<Blob | null> => {
        return new Promise(function (resolve) {
          canvas.toBlob(function (blob) {
            resolve(blob);
          }, 'image/jpeg');
        });
      };

      const newBlob = await getCanvasBlob(
        cropperRef.current.cropper.getCroppedCanvas()
      );

      return newBlob;
    }

    console.log(imageCandidate);
  }, [cropperRef, imageCandidate]);

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    document.addEventListener('open:image-cropper', openModal);
  });

  const onCancel = useCallback(() => {
    updateImageCandidate({ type: 'Cancel' });
    updateImageData({ type: 'Reset' });
    onClose();
  }, [onClose, updateImageData]);

  const onConfirm = useCallback(() => {
    const newBlob = getCropData();

    newBlob.then((blob) => {
      if (blob) {
        updateImageData({
          type: 'ConfirmCrop',
          payload: { blob: blob, preview: URL.createObjectURL(blob) },
        });
      } else console.log('blob is null');

      onClose();
    });
  }, [getCropData, onClose, updateImageData]);

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
          {imageData.imageBlob ? (
            <Cropper
              ref={cropperRef}
              src={URL.createObjectURL(imageData.imageBlob)}
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
          <Button
            className="rounded-md px-4 py-2 text-sm"
            onClick={() => {
              console.log(imageCandidate);
            }}
          >
            Debug
          </Button>

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
