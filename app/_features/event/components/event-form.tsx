'use client';

import Header from '@/_shared/components/header/header';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import GithubIcon from '@/_shared/components/icons/github-icon';
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
  Image,
} from '@nextui-org/react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import '../styles/date-picker.css';
import { DatePickerModal } from './event-date-picker';
import { TimePickerModal } from './event-time-picker';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import ClockFillIcon from '@/_shared/components/icons/clock-fill-icon';
import PhotoUploadIcon from '@/_shared/components/icons/photo-upload-icon';
import { PhotoDeleteIcon } from '@/_shared/components/icons/photo-delete-icon';

export default function EventForm() {
  const { user } = useAuthContext();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const today = new Date(new Date().setDate(new Date().getDate() + 1));
  const currentHour = today.getHours();
  const [date, setDate] = useState(today);
  const setStartTimeEvent = 'open:event-time-picker-start-modal';
  const setEndTimeEvent = 'open:event-time-picker-end-modal';
  const comingSoonEvent = 'open:feature-coming-soon-modal';
  const [startTime, setStartTime] = useState({
    hour: `${currentHour}`,
    minute: `${today.getMinutes().toString().padStart(2, '0')}`,
  });
  const [endTime, setEndTime] = useState({
    hour: `${currentHour + 1}`,
    minute: `${today.getMinutes().toString().padStart(2, '0')}`,
  });
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const { navigateTo } = useNavigate();

  const [minRows, setMinRows] = useState(window.innerWidth < 768 ? 3 : 12);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files && event.target.files[0];

      if (file) {
        setSelectedImage(file);

        // Create a URL for the selected file and set it as the image preview
        const previewURL = URL.createObjectURL(file);
        setImagePreview(previewURL);

        // Do something with the selected file, e.g., upload it to the server
        console.log('Selected file:', file);
      }
    },
    [] // Empty dependency array because the function doesn't depend on any external state or props
  );

  useEffect(() => {
    if (startTime.hour > endTime.hour) {
      setEndTime({
        hour: `${startTime.hour}`,
        minute: `${startTime.minute}`,
      });
    }
  }, [startTime.hour, startTime.minute, endTime.hour]);

  useEffect(() => {
    const handleResize = () => {
      setMinRows(window.innerWidth < 768 ? 3 : 12);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createEvent = useCallback(
    async (endpoint: string) => {
      const finalEndpoint = `/api/events/${endpoint}`;

      const eventStartTime = new Date(
        date.setHours(parseInt(startTime.hour), parseInt(startTime.minute), 0)
      );
      const eventEndTime = new Date(
        date.setHours(parseInt(endTime.hour), parseInt(endTime.minute), 0)
      );

      const data = JSON.stringify({
        name: eventName,
        startTime: eventStartTime.toISOString(),
        endTime: eventEndTime.toISOString(),
        description: eventDescription,
        host: user?.name,
      });

      console.log(data);

      const respEvent = await InternalApiFetcher.post(finalEndpoint, {
        body: data,
      });

      if (respEvent.ok) {
        console.log(respEvent.data);
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
      navigateTo,
      startTime.hour,
      startTime.minute,
      user?.name,
    ]
  );

  const onDraft = useCallback(() => {
    document.dispatchEvent(new CustomEvent(comingSoonEvent));
  }, []);

  const onPublish = useCallback(() => createEvent('create'), [createEvent]);

  return (
    <div className="min-viewport-height bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-4">
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
            <div className="collapse flex h-0 w-full flex-wrap gap-2 sm:visible sm:h-fit sm:w-fit">
              <Button
                onPress={onDraft}
                className="w-full rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-zinc-700 active:bg-zinc-600 sm:w-fit"
              >
                Save as draft
              </Button>
              <Button
                onPress={onPublish}
                className="w-full rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500 sm:w-fit"
              >
                Publish
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
                  minRows={minRows}
                  value={eventDescription}
                  onValueChange={setEventDescription}
                ></Textarea>
              </div>
            </div>
            {/* right side */}
            <div className="flex w-full flex-wrap items-start justify-start gap-2 sm:basis-1/2">
              <div className="flex w-full sm:mt-6">
                {imagePreview ? (
                  <div style={{ position: 'relative' }}>
                    <Image
                      width={560}
                      height={280}
                      alt="a poster related to the event"
                      src={imagePreview}
                      style={{ aspectRatio: '2/1', zIndex: 1 }}
                    ></Image>
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
        <div className="bottom-0 flex h-fit  flex-none gap-4 rounded-t-xl  py-6 sm:invisible sm:h-0 sm:py-0">
          <Button
            className="w-full rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-zinc-700 active:bg-zinc-600 sm:w-fit"
            onPress={onDraft}
          >
            Save as draft
          </Button>
          <Button
            className="w-full rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500 sm:w-fit"
            onPress={onPublish}
          >
            Publish
          </Button>
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
