'use client';

import Header from '@/_shared/components/header/header';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import { FormWithIcon } from '@/_shared/components/input/form-with-icon-title';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
  Image as NextImage,
} from '@nextui-org/react';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import '../styles/date-picker.css';
import '../styles/cropper.css';
import { DatePickerModal } from './event-date-picker';
import { TimePickerModal } from './event-time-picker';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import ClockFillIcon from '@/_shared/components/icons/clock-fill-icon';
import PhotoUploadIcon from '@/_shared/components/icons/photo-upload-icon';
import { PhotoDeleteIcon } from '@/_shared/components/icons/photo-delete-icon';
import { ActionType, ImageCropperModal, ImageState } from './image-cropper';
import { selectEvent } from '@/(server)/_features/event/schema';
import { compressImage } from '@/_shared/utils/compress-image';

const reducer = (state: ImageState, action: ActionType): ImageState => {
  switch (action.type) {
    case 'ConfirmCrop':
      return {
        imagePreview: action.payload.preview,
        imageBlob: action.payload.blob,
      };
    case 'PickFile':
      return { imagePreview: null, imageBlob: action.payload };
    case 'Reset':
      return { imagePreview: null, imageBlob: null };
    default:
      return state;
  }
};

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH;

export default function EventForm({
  data: existingEvent,
}: {
  data?: typeof selectEvent;
}) {
  // Constant for event
  const setStartTimeEvent = 'open:event-time-picker-start-modal';
  const setEndTimeEvent = 'open:event-time-picker-end-modal';
  const comingSoonEvent = 'open:feature-coming-soon-modal';
  const incompleteFieldEvent = 'open:missing-field-modal';

  // States
  const { user } = useAuthContext();
  const [imageData, updateImageData] = useReducer(reducer, {
    imageBlob: null,
    imagePreview: null,
  });
  const today = new Date(new Date().setDate(new Date().getDate() + 1));
  const currentHour = today.getHours();
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState({
    hour: `${currentHour}`,
    minute: `${today.getMinutes().toString().padStart(2, '0')}`,
  });
  const [endTime, setEndTime] = useState({
    hour: `${currentHour + 1}`,
    minute: `${today.getMinutes().toString().padStart(2, '0')}`,
  });
  const [isTitleValid, setTitleValid] = useState(false);
  const [isDescriptionValid, setDescValid] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [minRows, setMinRows] = useState(window.innerWidth < 768 ? 3 : 12);

  const { navigateTo } = useNavigate();

  const handleRemoveImage = useCallback(() => {
    updateImageData({ type: 'Reset' });
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files && event.target.files[0];

      if (file) {
        updateImageData({ type: 'PickFile', payload: file });

        document.dispatchEvent(new CustomEvent('open:image-cropper'));
      }
    },
    []
  );

  useEffect(() => {
    if (eventName.trim().length === 0) {
      setTitleValid(false);
    } else {
      setTitleValid(true);
    }
  }, [eventName]);

  useEffect(() => {
    if (eventDescription.trim().length === 0) {
      setDescValid(false);
    } else {
      setDescValid(true);
    }
  }, [eventDescription]);

  useEffect(() => {
    if (startTime.hour > endTime.hour) {
      setEndTime({
        hour: `${startTime.hour}`,
        minute: `${startTime.minute}`,
      });
    }
  }, [startTime.hour, startTime.minute, endTime.hour]);

  const createEvent = useCallback(
    async (isDraft: boolean) => {
      if (
        eventDescription.trim().length === 0 ||
        eventName.trim().length === 0
      ) {
        document.dispatchEvent(new CustomEvent(incompleteFieldEvent));
        return;
      }

      const finalEndpoint = `/api/events/create`;

      const eventStartTime = new Date(
        date.setHours(parseInt(startTime.hour), parseInt(startTime.minute), 0)
      );
      const eventEndTime = new Date(
        date.setHours(parseInt(endTime.hour), parseInt(endTime.minute), 0)
      );

      let imageFile: File | Blob | null = null;

      if (imageData.imageBlob) {
        imageFile = await compressImage(imageData.imageBlob, 280, 560, 0.8);
      }

      const data = JSON.stringify({
        name: eventName,
        startTime: eventStartTime.toISOString(),
        endTime: eventEndTime.toISOString(),
        description: eventDescription.replace(/(?:\r\n|\r|\n)/g, '<br>'),
        host: user?.name,
        isPublished: !isDraft,
      });

      const formData = new FormData();

      if (imageFile) {
        formData.append('image', imageFile, 'poster.webp');
      }
      formData.append('data', data);

      const respEvent = await InternalApiFetcher.post(finalEndpoint, {
        body: formData,
        headers: undefined,
      });

      if (respEvent.ok) {
        const redirectPath = new URL(
          `/event/${respEvent.data.slug}`,
          window.location.origin
        ).href;
        navigateTo(redirectPath);
      } else {
        console.log(respEvent.message);
      }
    },
    [
      date,
      endTime.hour,
      endTime.minute,
      eventDescription,
      eventName,
      imageData,
      navigateTo,
      startTime.hour,
      startTime.minute,
      user?.name,
    ]
  );

  const saveAsDraft = useCallback(() => {
    createEvent(true);
  }, [createEvent]);

  const updateDraft = useCallback(() => {
    console.log('update draft');
  }, []);

  const onPublish = useCallback(() => createEvent(true), [createEvent]);

  const updatePublishedEvent = useCallback(() => {
    console.log('update published event');
  }, []);

  return (
    <div className="min-viewport-height bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-4">
        <LoginModal loggedIn={user ? true : false}></LoginModal>
        <MissingField event={incompleteFieldEvent}></MissingField>
        <ImageCropperModal
          imageData={imageData}
          updateImageData={updateImageData}
        ></ImageCropperModal>
        <ComingSoonModal event={comingSoonEvent}></ComingSoonModal>
        <TimePickerModal
          event={setStartTimeEvent}
          hour={startTime.hour}
          minute={startTime.minute}
          setTime={setStartTime}
          title={'Set event starting time'}
        />
        <TimePickerModal
          event={setEndTimeEvent}
          hour={endTime.hour}
          minute={endTime.minute}
          setTime={setEndTime}
          startHourLimit={parseInt(startTime.hour)}
          title={'Set event ending time'}
        />
        <DatePickerModal startDate={date} setStartDate={setDate} />
        <div className="flex-none">
          <Header logoText="inLive Event" logoHref="/event" needAuth={true} />
        </div>

        <div className="flex grow flex-col items-start">
          {/* Create Event Header */}
          <div className="flex h-fit w-full justify-between gap-0 pb-6 sm:gap-4">
            <div className="w-full sm:w-fit">
              <h1 className="text-md w-full font-semibold tracking-wide sm:w-fit lg:text-xl">
                Lets create your event
              </h1>
            </div>
            <div className="fixed bottom-0 left-0 flex w-full gap-2 border-t border-zinc-700 bg-zinc-900 px-4 py-3 sm:relative sm:w-fit sm:border-t-0 sm:bg-transparent lg:p-0">
              {existingEvent === undefined ||
              existingEvent.isPublished === false ? (
                <Button
                  onPress={existingEvent ? updateDraft : saveAsDraft}
                  className="w-full rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-zinc-700 active:bg-zinc-600 sm:w-fit"
                >
                  {existingEvent ? 'Update Draft' : 'Save as draft'}
                </Button>
              ) : null}
              <Button
                onPress={
                  existingEvent?.isPublished ? updatePublishedEvent : onPublish
                }
                className="w-full rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500 sm:w-fit"
              >
                {existingEvent?.isPublished ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
          {/* column */}
          <div className="flex w-full flex-1 flex-col flex-wrap items-start gap-4 sm:flex-row sm:flex-nowrap">
            {/* left side */}
            <div className="flex h-fit w-full flex-none flex-col items-start gap-6 sm:flex-1 sm:basis-1/2">
              <div className="w-full flex-none gap-4">
                <Input
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      'border-0 bg-zinc-950 ring-1 ring-zinc-700 data-[hover=true]:bg-zinc-950 group-data-[focus=true]:bg-zinc-950 group-data-[focus=true]:ring-zinc-400 group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-1 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-1 group-data-[focus-visible=true]:ring-zinc-400',
                  }}
                  label="Title"
                  placeholder="Event Title"
                  labelPlacement="outside"
                  radius="sm"
                  value={eventName}
                  onValueChange={setEventName}
                  isRequired
                  isInvalid={!isTitleValid}
                  errorMessage={!isTitleValid && 'Event title is required'}
                />
              </div>
              <div className="max-h-fit w-full flex-1 gap-4">
                <Textarea
                  className="grow"
                  classNames={{
                    inputWrapper:
                      'bg-zinc-950 ring-1 ring-zinc-700 data-[hover=true]:bg-zinc-950 group-data-[focus=true]:bg-zinc-950 group-data-[focus=true]:ring-zinc-400 group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-1 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-1 group-data-[focus-visible=true]:ring-zinc-400',
                  }}
                  label="Description"
                  labelPlacement="outside"
                  radius="sm"
                  value={eventDescription}
                  onValueChange={setEventDescription}
                  isInvalid={!isDescriptionValid}
                  isRequired
                  errorMessage={
                    !isDescriptionValid && 'Event description is required'
                  }
                ></Textarea>
              </div>
            </div>
            {/* right side */}
            <div className="flex w-full flex-wrap items-start justify-start gap-2 sm:basis-1/2">
              <div className="flex w-full sm:mt-6">
                {imageData.imagePreview ? (
                  <div style={{ position: 'relative' }}>
                    <NextImage
                      width={560}
                      height={280}
                      alt="a poster related to the event"
                      src={imageData.imagePreview}
                      style={{
                        aspectRatio: '2/1',
                        zIndex: 1,
                        objectFit: 'cover',
                      }}
                    ></NextImage>
                    <Button
                      className="hover:opactiy-100 mr-2  mt-2 bg-red-800 opacity-30 active:opacity-100"
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        zIndex: 99,
                      }}
                      onClick={handleRemoveImage}
                      isIconOnly
                    >
                      <PhotoDeleteIcon width={24} height={24}></PhotoDeleteIcon>
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex w-full flex-1 flex-col items-center justify-center rounded-lg bg-zinc-950 outline-none ring-1 ring-zinc-700 focus:ring-zinc-400"
                    style={{
                      aspectRatio: '2/1',
                    }}
                    onClick={() => {
                      document.getElementById('fileInput')?.click();
                    }}
                  >
                    <input
                      type="file"
                      id="fileInput"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                      accept="image/*"
                    />
                    <PhotoUploadIcon width={56} height={56}></PhotoUploadIcon>
                    <p className="mt-2 rounded-sm text-sm font-semibold text-zinc-400">
                      click to add poster image
                    </p>
                    <p className="mt-1 text-xs">Support PNG, WEBP, JPG, JPEG</p>
                    <p className="mt-1 text-xs">560 x 280, Aspect ratio 2:1</p>
                  </div>
                )}
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:flex-nowrap">
                <div className="w-full sm:basis-1/3">
                  <FormWithIcon
                    title="Event Date"
                    icon={<CalendarIcon width={24} height={24}></CalendarIcon>}
                    isReadOnly={true}
                    onClickForm={() => {
                      document.dispatchEvent(
                        new CustomEvent('open:event-date-picker-modal')
                      );
                    }}
                    value={new Intl.DateTimeFormat('en-GB').format(date)}
                    onClickIcon={() => {
                      document.dispatchEvent(
                        new CustomEvent('open:event-date-picker-modal')
                      );
                    }}
                  ></FormWithIcon>
                </div>
                <div className="w-full sm:basis-1/3">
                  <FormWithIcon
                    value={`${startTime.hour}:${startTime.minute}`}
                    title="Start Time"
                    icon={
                      <ClockFillIcon width={24} height={24}></ClockFillIcon>
                    }
                    isReadOnly={true}
                    onClickForm={() => {
                      document.dispatchEvent(
                        new CustomEvent('open:event-time-picker-start-modal')
                      );
                    }}
                    onClickIcon={() => {
                      document.dispatchEvent(
                        new CustomEvent('open:event-time-picker-start-modal')
                      );
                    }}
                  ></FormWithIcon>
                </div>
                <div className="w-full sm:basis-1/3">
                  <FormWithIcon
                    title="End Time"
                    value={`${endTime.hour}:${endTime.minute}`}
                    icon={
                      <ClockFillIcon width={24} height={24}></ClockFillIcon>
                    }
                    isReadOnly={true}
                    onClickForm={() => {
                      document.dispatchEvent(new CustomEvent(setEndTimeEvent));
                    }}
                    onClickIcon={() => {
                      document.dispatchEvent(new CustomEvent(setEndTimeEvent));
                    }}
                  ></FormWithIcon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoonModal({ event }: { event: string }) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const openModal = useCallback(() => {
    console.log('open coming soon modal');
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    document.addEventListener(event, openModal);
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="auto">
      <ModalContent>
        <ModalHeader>Coming Soon</ModalHeader>
        <ModalBody>This feature will be added at a later update</ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function LoginModal({ loggedIn }: { loggedIn: boolean }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { navigateTo } = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      onOpen();
    }
  });

  const onConfirm = useCallback(() => {
    navigateTo('/');
  }, [navigateTo]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="auto">
      <ModalContent>
        <ModalHeader>Login Required</ModalHeader>
        <ModalBody>Please login to continue.</ModalBody>
        <ModalFooter>
          <Button className="w-full,flex-1" onClick={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function MissingField({ event }: { event: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    document.addEventListener(event, onOpen);
  });

  const onConfirm = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="auto">
      <ModalContent>
        <ModalHeader>Incomplete Field</ModalHeader>
        <ModalBody>Please fill in all the required fields.</ModalBody>
        <ModalFooter>
          <Button className="w-full,flex-1" onClick={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
