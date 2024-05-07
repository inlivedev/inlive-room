'use client';

import {
  useCallback,
  useEffect,
  useState,
  useReducer,
  type ChangeEvent,
} from 'react';
import { Button } from '@nextui-org/react';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import type { EventType } from '@/_shared/types/event';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import ClockFillIcon from '@/_shared/components/icons/clock-fill-icon';
import PhotoUploadIcon from '@/_shared/components/icons/photo-upload-icon';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { compressImage } from '@/_shared/utils/compress-image';
import { ActionType, ImageCropperModal, ImageState } from './image-cropper';
import { StatusPublished, StatusDraft, StatusCancelled } from './event-status';
import CancelEventModal from './event-cancel-modal';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';

const DeleteEventModal = dynamic(() => import('./event-delete-modal'));
const DatePickerModal = dynamic(() => import('./event-date-picker'));
const TimePickerModal = dynamic(() => import('./event-time-picker'));

type InputsType = {
  eventTitle: string;
  eventDescription: string;
  eventDate: Date;
  eventStartTime: {
    hour: number;
    minute: number;
  };
  eventEndTime: {
    hour: number;
    minute: number;
  };
  maximumSlots: number;
  isLimitSlot: boolean;
};

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
    case 'FetchExisting':
      return { imagePreview: action.payload.preview, imageBlob: null };
    default:
      return state;
  }
};

export default function EventForm({
  data: existingEvent,
  limitPublish,
}: {
  data?: EventType.Event;
  limitPublish?: boolean;
}) {
  const { user } = useAuthContext();
  const { navigateTo } = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date();
  const currentHour = today.getHours();
  const defaultEventDate = existingEvent?.startTime || today;
  const defaultEventStartTime = existingEvent?.startTime
    ? {
        hour: existingEvent.startTime.getHours(),
        minute: existingEvent.startTime.getMinutes(),
      }
    : {
        hour: currentHour,
        minute: 0,
      };

  const defaultEventEndTime = existingEvent?.endTime
    ? {
        hour: existingEvent.endTime.getHours(),
        minute: existingEvent.endTime.getMinutes(),
      }
    : {
        hour: currentHour == 23 ? 23 : currentHour + 1,
        minute: 0,
      };

  const defaultMaximumSlots = existingEvent?.maximumSlots || 50;
  const defaultIsLimitSlot = existingEvent?.maximumSlots ? true : false;

  // Constant for event
  const openStartTimePickerEvent = 'open:event-start-time-picker-modal';
  const openEndTimePickerEvent = 'open:event-end-time-picker-modal';

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<InputsType>({
    mode: 'onTouched',
    disabled: !user,
    defaultValues: {
      eventDate: defaultEventDate,
      eventStartTime: defaultEventStartTime,
      eventEndTime: defaultEventEndTime,
      maximumSlots: defaultMaximumSlots,
      isLimitSlot: defaultIsLimitSlot,
    },
  });

  const maximumSlots = useWatch({
    control,
    name: 'maximumSlots',
  });

  const isLimitSlot = watch('isLimitSlot');

  useEffect(() => {
    if (maximumSlots > 100) {
      setValue('maximumSlots', 100);
    }
  }, [maximumSlots, setValue]);

  const eventDate = useWatch({
    control,
    name: 'eventDate',
  });

  const eventStartTime = useWatch({
    control,
    name: 'eventStartTime',
  });

  const eventEndTime = useWatch({
    control,
    name: 'eventEndTime',
  });

  const defaultImageDataState = {
    imageBlob: null,
    imagePreview: existingEvent?.thumbnailUrl
      ? `/static${existingEvent.thumbnailUrl}`
      : null,
  };

  const [imageData, updateImageData] = useReducer(
    reducer,
    defaultImageDataState
  );

  useEffect(() => {
    const datePickerConfirmation = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const selectedDate = detail.selectedDate;

      setValue('eventDate', selectedDate);
    }) as EventListener;

    document.addEventListener(
      'trigger:date-picker-confirmation',
      datePickerConfirmation
    );

    return () => {
      document.removeEventListener(
        'trigger:date-picker-confirmation',
        datePickerConfirmation
      );
    };
  }, [setValue]);

  useEffect(() => {
    if (eventStartTime.hour === 23) {
      if (
        eventStartTime.minute === 45 &&
        !(eventEndTime.hour === 23 && eventEndTime.minute === 59)
      ) {
        setValue('eventEndTime', { hour: 23, minute: 59 });
        return;
      }
    }

    if (eventStartTime.hour === eventEndTime.hour) {
      if (eventStartTime.minute === 45) {
        setValue('eventEndTime', {
          hour: eventStartTime.hour + 1,
          minute: 0,
        });
        return;
      }
      if (eventStartTime.minute >= eventEndTime.minute) {
        setValue('eventEndTime', {
          hour: eventStartTime.hour,
          minute: eventStartTime.minute + 15,
        });
        return;
      }
    }

    if (eventStartTime.hour > eventEndTime.hour) {
      setValue('eventEndTime', {
        hour: eventStartTime.hour,
        minute: eventStartTime.minute + 15,
      });
      return;
    }
  }, [eventStartTime, eventEndTime, setValue]);

  const onSubmit: SubmitHandler<InputsType> = async (data, event) => {
    if (!user) return;

    const submitEvent = event as React.SyntheticEvent<
      HTMLFormElement,
      SubmitEvent
    >;

    const submitter = submitEvent.nativeEvent.submitter;

    if (submitter && !isSubmitting) {
      setIsSubmitting(true);

      type Action =
        | 'create-as-publish'
        | 'create-as-draft'
        | 'update-as-publish'
        | 'update-as-draft';
      const action = submitter.getAttribute('data-action') as Action;
      const maximumSlots = data.isLimitSlot ? data.maximumSlots : 0;

      const eventTitle = data.eventTitle;
      const eventDescription = data.eventDescription.replace(
        /(?:\r\n|\r|\n)/g,
        '<br>'
      );
      const host = user.name;
      const startTime = new Date(
        data.eventDate.setHours(
          data.eventStartTime.hour,
          data.eventStartTime.minute,
          0
        )
      ).toISOString();

      const endTime = new Date(
        data.eventDate.setHours(
          data.eventEndTime.hour,
          data.eventEndTime.minute,
          0
        )
      ).toISOString();

      const posterImage = imageData.imageBlob
        ? await compressImage(imageData.imageBlob, 320, 640, 0.8)
        : null;

      if (action === 'create-as-publish') {
        await saveChanges({
          eventTitle,
          eventDescription,
          host,
          startTime,
          endTime,
          posterImage,
          publish: true,
          newData: true,
          maximumSlots,
        });
      } else if (action === 'create-as-draft') {
        await saveChanges({
          eventTitle,
          eventDescription,
          host,
          startTime,
          endTime,
          posterImage,
          publish: false,
          newData: true,
          maximumSlots,
        });
      } else if (action === 'update-as-publish') {
        await saveChanges({
          eventTitle,
          eventDescription,
          host,
          startTime,
          endTime,
          posterImage,
          publish: true,
          newData: false,
          maximumSlots,
        });
      } else if (action === 'update-as-draft') {
        await saveChanges({
          eventTitle,
          eventDescription,
          host,
          startTime,
          endTime,
          posterImage,
          publish: false,
          newData: false,
          maximumSlots,
        });
      }

      setIsSubmitting(false);
    }
  };

  const handleSelectImage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const target = event.target;
      const file = target.files && target.files[0];

      if (file) {
        updateImageData({ type: 'PickFile', payload: file });
        document.dispatchEvent(new CustomEvent('open:image-cropper'));
      }

      // this is to reset the input value so that the same file can be selected again
      target.value = '';
    },
    []
  );

  const saveChanges = useCallback(
    async ({
      eventTitle,
      eventDescription,
      startTime,
      endTime,
      posterImage,
      publish = false,
      newData = true,
      maximumSlots,
    }: {
      eventTitle: string;
      eventDescription: string;
      host: string;
      startTime: string;
      endTime: string;
      posterImage: Blob | null;
      publish: boolean;
      newData: boolean;
      maximumSlots: number;
    }) => {
      const deleteImage = newData || imageData.imagePreview ? false : true;

      const data = {
        name: eventTitle,
        description: eventDescription,
        startTime: startTime,
        endTime: endTime,
        status: publish ? 'published' : 'draft',
        deleteImage: deleteImage,
        maximumSlots: isLimitSlot ? Number(maximumSlots) : undefined,
        type: 'event',
      };

      const formData = new FormData();

      if (posterImage) {
        formData.append('image', posterImage, 'poster.webp');
      }

      formData.append('data', JSON.stringify(data));

      if (newData) {
        const response = await InternalApiFetcher.post(`/api/events/create`, {
          body: formData,
          // must set headers to undefined, so the content-type will be set properly automatically
          headers: undefined,
        });

        if (response.ok) {
          if (publish) {
            navigateTo(`/events/${response.data.slug}/detail`);
          } else {
            navigateTo(`/events`);
          }
        } else {
          alert('Failed to create event, please try again later');
        }
      } else {
        const response = await InternalApiFetcher.put(
          `/api/events/${existingEvent?.id}`,
          {
            body: formData,
            headers: undefined,
          }
        );

        if (response.ok) {
          navigateTo(`/events/${response.data.slug}/detail`);
        } else {
          alert('Failed to save the changes, please try again later');
        }
      }
    },
    [imageData.imagePreview, isLimitSlot, navigateTo, existingEvent?.id]
  );

  const eventDateString = useFormattedDateTime(eventDate, 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      {existingEvent && existingEvent.status == 'draft' && (
        <DeleteEventModal slug={existingEvent.slug}></DeleteEventModal>
      )}
      {existingEvent && existingEvent.status == 'published' && (
        <CancelEventModal slug={existingEvent.slug}></CancelEventModal>
      )}
      <ImageCropperModal
        imageData={imageData}
        updateImageData={updateImageData}
      ></ImageCropperModal>
      <DatePickerModal type="event-date" heading="Set event date" />
      <TimePickerModal
        heading="Set start time of event"
        event={openStartTimePickerEvent}
        hour={eventStartTime.hour}
        minute={eventStartTime.minute}
        setTime={(value: any) => {
          setValue('eventStartTime', value);
        }}
        startHour={
          today.getDate() == eventDate.getDate() &&
          today.getMonth() == eventDate.getMonth() &&
          today.getFullYear() == eventDate.getFullYear()
            ? today.getHours()
            : 0
        }
        step={15}
      />
      <TimePickerModal
        heading="Set end time of event"
        event={openEndTimePickerEvent}
        hour={eventEndTime.hour}
        minute={eventEndTime.minute}
        setTime={(value: any) => {
          setValue('eventEndTime', value);
        }}
        startHour={eventStartTime.hour}
        startMinute={eventStartTime.minute}
        isEndTime={true}
        step={15}
      />
      <div className="bg-zinc-900">
        <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4">
          <Header logoText="inLive Room" logoHref="/" />
          <main className="flex-1">
            {!user ? (
              <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between gap-4 rounded-md bg-blue-900/25 px-4 py-3 text-blue-300 sm:px-6">
                <p className=" text-pretty">
                  Just sign in and you can start creating your event now!
                </p>
                <Button
                  className="h-8 rounded-md bg-transparent px-3 text-sm font-medium text-blue-300 ring-2 ring-blue-300"
                  onClick={() =>
                    document.dispatchEvent(
                      new CustomEvent('open:sign-in-modal')
                    )
                  }
                >
                  Sign In
                </Button>
              </div>
            ) : null}
            <form onSubmit={handleSubmit(onSubmit)}>
              {existingEvent ? (
                <div className="mb-1.5">
                  {(() => {
                    switch (existingEvent.status) {
                      case 'published':
                        return <StatusPublished />;
                      case 'draft':
                        return <StatusDraft />;
                      case 'cancelled':
                        return <StatusCancelled />;
                    }
                  })()}
                </div>
              ) : null}
              <div>
                <div className="flex flex-col gap-5 lg:flex-row">
                  <h2 className="flex-auto text-2xl font-bold leading-9 text-zinc-100 lg:text-3xl lg:leading-10">
                    {existingEvent
                      ? 'Edit your event data'
                      : "Let's create your event"}
                  </h2>
                  {user ? (
                    <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:border-0 lg:bg-transparent lg:p-0">
                      <div className="flex gap-4">
                        <div className="flex-1 lg:order-2">
                          <Button
                            type="submit"
                            data-action={
                              existingEvent
                                ? 'update-as-publish'
                                : 'create-as-publish'
                            }
                            className="w-full min-w-0 rounded-lg bg-red-700 px-6 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500 lg:w-auto"
                            isDisabled={isSubmitting || limitPublish}
                            aria-disabled={isSubmitting || limitPublish}
                            disabled={isSubmitting || limitPublish}
                          >
                            {existingEvent
                              ? existingEvent.status === 'published'
                                ? 'Save changes'
                                : 'Publish event'
                              : 'Publish event'}
                          </Button>
                        </div>
                        {existingEvent?.status == 'draft' ||
                        existingEvent === undefined ? (
                          <div className="flex-1 lg:order-1">
                            <Button
                              type="submit"
                              data-action={
                                existingEvent
                                  ? 'update-as-draft'
                                  : 'create-as-draft'
                              }
                              className="w-full min-w-0 rounded-lg bg-zinc-800 px-6 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600 lg:w-auto"
                              isDisabled={isSubmitting}
                              aria-disabled={isSubmitting}
                              disabled={isSubmitting}
                            >
                              Save as draft
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-6 pb-28 lg:flex-row lg:pb-10">
                <div className="flex flex-1 flex-col gap-6">
                  <div>
                    <label
                      htmlFor="event-title"
                      className="mb-1 block text-sm font-medium text-zinc-200"
                    >
                      Event title<span className="ml-0.5 text-red-500">*</span>
                    </label>
                    <input
                      id="event-title"
                      className="block w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm shadow-sm  outline-none ring-1 ring-zinc-800 placeholder:text-zinc-400  focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-800"
                      type="text"
                      placeholder={user ? `Give your event a title` : ''}
                      autoComplete="off"
                      aria-disabled={!user}
                      disabled={!user}
                      defaultValue={existingEvent?.name || ''}
                      {...register('eventTitle', {
                        required: true,
                      })}
                    />
                    {errors.eventTitle ? (
                      <>
                        {errors.eventTitle.type === 'required' ? (
                          <div className="mx-1 mt-1 text-xs font-medium text-red-400">
                            Please fill out this field
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  <div>
                    <label
                      htmlFor="event-description"
                      className="mb-1 block text-sm font-medium text-zinc-200"
                    >
                      Event description
                      <span className="ml-0.5 text-red-500">*</span>
                    </label>
                    <textarea
                      id="event-description"
                      className="block min-h-60 w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm shadow-sm  outline-none ring-1 ring-zinc-800 placeholder:text-zinc-400 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:resize-none disabled:bg-zinc-800 lg:min-h-80"
                      placeholder={
                        user ? `Give a clear information about the event` : ''
                      }
                      autoComplete="off"
                      aria-disabled={!user}
                      disabled={!user}
                      defaultValue={existingEvent?.description || ''}
                      {...register('eventDescription', {
                        required: true,
                      })}
                    ></textarea>
                    {errors.eventDescription ? (
                      <>
                        {errors.eventDescription.type === 'required' ? (
                          <div className="mx-1 mt-1 text-xs font-medium text-red-400">
                            Please fill out this field
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-6">
                    <div>
                      {imageData.imagePreview ? (
                        <div className="relative">
                          <NextImage
                            width={560}
                            height={280}
                            src={imageData.imagePreview}
                            alt="Event poster image"
                            className="w-full rounded object-cover"
                            style={{ aspectRatio: '2/1' }}
                            unoptimized
                          ></NextImage>
                          <Button
                            className="absolute right-3 top-3 z-10 inline-block h-8 min-h-0 min-w-0 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-sm font-medium antialiased hover:bg-zinc-700 lg:order-1"
                            title="Remove this poster image"
                            onPress={() => {
                              updateImageData({ type: 'Reset' });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <label
                            htmlFor="file-input"
                            className={`flex w-full  flex-col items-center justify-center rounded-md p-6 shadow-sm outline-none  ring-1 ring-zinc-800 ${
                              !user
                                ? 'cursor-not-allowed bg-zinc-800 text-zinc-400'
                                : 'cursor-pointer bg-zinc-950 hover:bg-zinc-950/40'
                            }`}
                            style={{ aspectRatio: '2/1' }}
                          >
                            <div className="mb-3">
                              <PhotoUploadIcon
                                width={48}
                                height={48}
                                className="text-zinc-400"
                              ></PhotoUploadIcon>
                            </div>
                            {user ? (
                              <p className="text-sm font-medium text-zinc-400">
                                Click to add poster image
                              </p>
                            ) : null}
                            <p className="mt-1 text-xs">
                              Support PNG, JPG, JPEG, WEBP
                            </p>
                            <p className="mt-1 text-xs">
                              640 x 320. Aspect ratio 2:1
                            </p>
                            <input
                              id="file-input"
                              type="file"
                              className="hidden"
                              onChange={handleSelectImage}
                              accept="image/png, image/jpeg, image/webp"
                              aria-disabled={!user}
                              disabled={!user}
                            />
                          </label>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex-1">
                        <label
                          htmlFor="event-date"
                          className="mb-1 block text-sm font-medium text-zinc-200"
                        >
                          Event date
                        </label>
                        <div className="relative">
                          <input
                            id="event-date"
                            className="block w-full cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-sm  text-zinc-400 shadow-sm outline-none ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800"
                            type="text"
                            readOnly
                            aria-disabled={!user}
                            disabled={!user}
                            onClick={() => {
                              document.dispatchEvent(
                                new CustomEvent('open:date-picker-modal', {
                                  detail: {
                                    currentDate: eventDate,
                                  },
                                })
                              );
                            }}
                            value={user ? eventDateString : ''}
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-transparent text-zinc-400">
                            <CalendarIcon />
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor="event-start-time"
                          className="mb-1 block text-sm font-medium text-zinc-200"
                        >
                          Event start time
                        </label>
                        <div className="relative">
                          <input
                            id="event-start-time"
                            className="block w-full cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-sm  text-zinc-400 shadow-sm outline-none ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800"
                            type="text"
                            readOnly
                            aria-disabled={!user}
                            disabled={!user}
                            onClick={() => {
                              document.dispatchEvent(
                                new CustomEvent(openStartTimePickerEvent)
                              );
                            }}
                            value={
                              user
                                ? `${eventStartTime.hour
                                    .toString()
                                    .padStart(2, '0')}:${eventStartTime.minute
                                    .toString()
                                    .padStart(2, '0')}`
                                : ''
                            }
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-transparent text-zinc-400">
                            <ClockFillIcon />
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor="event-end-time"
                          className="mb-1 block text-sm font-medium text-zinc-200"
                        >
                          Event end time
                        </label>
                        <div className="relative">
                          <input
                            id="event-end-time"
                            className="block w-full cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-sm  text-zinc-400 shadow-sm outline-none ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800"
                            type="text"
                            readOnly
                            aria-disabled={!user}
                            disabled={!user}
                            onClick={() => {
                              document.dispatchEvent(
                                new CustomEvent(openEndTimePickerEvent)
                              );
                            }}
                            value={
                              user
                                ? `${eventEndTime.hour
                                    .toString()
                                    .padStart(2, '0')}:${eventEndTime.minute
                                    .toString()
                                    .padStart(2, '0')}`
                                : ''
                            }
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-transparent text-zinc-400">
                            <ClockFillIcon />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
                      <label
                        htmlFor="isLimitSlot"
                        className="order-1 block h-[40px] w-full flex-1 cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 shadow-sm outline-none  ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800 sm:order-2 sm:mt-[1.5rem]"
                      >
                        <input
                          type="checkbox"
                          id="isLimitSlot"
                          className="mr-2"
                          checked={isLimitSlot}
                          {...register('isLimitSlot', {
                            onChange: () => {
                              setValue('isLimitSlot', !isLimitSlot);
                            },
                            disabled: !user,
                          })}
                        />
                        Limit the number of participants
                      </label>

                      <div className="w-full flex-1">
                        <label className="mb-1 block text-sm font-medium text-zinc-200">
                          Participant Slot{' '}
                          <span className="font-normal">{`(Max : 100)`}</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={10}
                            max={100}
                            defaultValue={defaultMaximumSlots}
                            className="block w-full cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400  shadow-sm outline-none ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800"
                            {...register('maximumSlots', {
                              max: 100,
                              min: 10,
                              required: true,
                              disabled: !watch('isLimitSlot') || !user,
                              validate: (value) => {
                                return (
                                  isLimitSlot && value >= 10 && value <= 100
                                );
                              },
                            })}
                          />
                          {errors.maximumSlots ? (
                            <>
                              {errors.maximumSlots.type === 'min' ? (
                                <div className="mx-1 mt-1 text-xs font-medium text-red-400">
                                  Minimum number of participants is 10
                                </div>
                              ) : null}
                              {errors.maximumSlots.type === 'max' ? (
                                <div className="mx-1 mt-1 text-xs font-medium text-red-400">
                                  Maximum number of participants is 100
                                </div>
                              ) : null}
                              {errors.maximumSlots.type === 'required' ? (
                                <div className="mx-1 mt-1 text-xs font-medium text-red-400">
                                  Please fill out this field
                                </div>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  {existingEvent ? (
                    <div className="mt-20 flex justify-center lg:mt-12 lg:justify-end">
                      {(() => {
                        switch (existingEvent.status) {
                          case 'draft':
                            return (
                              <Button
                                className="h-9 w-60 rounded-lg bg-transparent px-3 py-1.5 text-base font-medium text-red-400 antialiased ring-2 ring-red-900 active:ring-red-700"
                                onPress={() => {
                                  document.dispatchEvent(
                                    new CustomEvent('open:event-delete-modal')
                                  );
                                }}
                              >
                                Delete this event
                              </Button>
                            );
                          case 'published':
                            return (
                              <Button
                                className="h-9 w-60 rounded-lg bg-transparent px-3 py-1.5 text-base font-medium text-red-400 antialiased ring-2 ring-red-900 active:ring-red-700"
                                onPress={() => {
                                  document.dispatchEvent(
                                    new CustomEvent('open:event-cancel-modal')
                                  );
                                }}
                              >
                                Cancel this event
                              </Button>
                            );
                        }
                      })()}
                    </div>
                  ) : null}
                </div>
              </div>
            </form>
          </main>
          <div className="hidden lg:block">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
