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
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import type { EventType } from '@/_shared/types/event';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import ClockFillIcon from '@/_shared/components/icons/clock-fill-icon';
import PhotoUploadIcon from '@/_shared/components/icons/photo-upload-icon';
import DeleteIcon from '@/_shared/components/icons/delete-icon';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { compressImage } from '@/_shared/utils/compress-image';
import { DeleteEventModal } from './event-delete-modal';
import { DatePickerModal } from './event-date-picker';
import { ActionType, ImageCropperModal, ImageState } from './image-cropper';

type InputsType = {
  eventTitle: string;
  eventDescription: string;
  eventDate: Date;
  eventStartTime: Date;
  eventEndTime: Date;
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
}: {
  data?: EventType.Event;
}) {
  const { user } = useAuthContext();
  const { navigateTo } = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date();
  const currentHour = today.getHours();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<InputsType>({
    mode: 'onTouched',
    defaultValues: {
      eventDate: existingEvent?.startTime || today,
    },
  });

  const eventDate = useWatch({
    control,
    name: 'eventDate',
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

  const onSubmit: SubmitHandler<InputsType> = async (data, event) => {
    if (!user) return;

    const submitEvent = event as React.SyntheticEvent<
      HTMLFormElement,
      SubmitEvent
    >;

    const submitter = submitEvent.nativeEvent.submitter;

    if (submitter && !isSubmitting) {
      setIsSubmitting(true);

      type Action = 'publish' | 'save-as-draft' | 'update';
      const action = submitter.getAttribute('data-action') as Action;

      const eventTitle = data.eventTitle;
      const eventDescription = data.eventDescription.replace(
        /(?:\r\n|\r|\n)/g,
        '<br>'
      );
      const host = user.name;
      const startTime = new Date().toISOString();
      const endTime = new Date().toISOString();
      const posterImage = imageData.imageBlob
        ? await compressImage(imageData.imageBlob, 280, 560, 0.8)
        : null;

      if (action === 'publish') {
        await createEvent({
          eventTitle,
          eventDescription,
          host,
          startTime,
          endTime,
          posterImage,
          publish: true,
        });
      } else if (action === 'save-as-draft') {
        await createEvent({
          eventTitle,
          eventDescription,
          host,
          startTime,
          endTime,
          posterImage,
          publish: false,
        });
      } else if (action === 'update') {
        await updateEvent({
          eventTitle,
          eventDescription,
          host,
          startTime,
          endTime,
          posterImage,
          publish: existingEvent?.isPublished || false,
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

  const createEvent = useCallback(
    async ({
      eventTitle,
      eventDescription,
      host,
      startTime,
      endTime,
      posterImage,
      publish = false,
    }: {
      eventTitle: string;
      eventDescription: string;
      host: string;
      startTime: string;
      endTime: string;
      posterImage: Blob | null;
      publish: boolean;
    }) => {
      const data = {
        name: eventTitle,
        description: eventDescription,
        host: host,
        startTime: startTime,
        endTime: endTime,
        isPublished: publish,
      };

      const formData = new FormData();

      if (posterImage) {
        formData.append('image', posterImage, 'poster.webp');
      }

      formData.append('data', JSON.stringify(data));

      const response = await InternalApiFetcher.post(`/api/events/create`, {
        body: formData,
        headers: undefined,
      });

      if (response.ok) {
        if (publish) {
          navigateTo(`/event/${response.data.slug}`);
        } else {
          navigateTo(`/event`);
        }
      } else {
        alert('Failed to create event, please try again later');
      }
    },
    [navigateTo]
  );

  const updateEvent = useCallback(
    async ({
      eventTitle,
      eventDescription,
      host,
      startTime,
      endTime,
      posterImage,
      publish = false,
    }: {
      eventTitle: string;
      eventDescription: string;
      host: string;
      startTime: string;
      endTime: string;
      posterImage: Blob | null;
      publish: boolean;
    }) => {
      const deleteImage = imageData.imagePreview ? false : true;

      const data = {
        name: eventTitle,
        description: eventDescription,
        host: host,
        startTime: startTime,
        endTime: endTime,
        isPublished: publish,
        deleteImage: deleteImage,
      };

      const formData = new FormData();

      if (posterImage) {
        formData.append('image', posterImage, 'poster.webp');
      }

      formData.append('data', JSON.stringify(data));

      const response = await InternalApiFetcher.put(
        `/api/events/${existingEvent?.id}`,
        {
          body: formData,
          // must set headers to undefined, so the content-type will be set properly automatically
          headers: undefined,
        }
      );
      if (response.ok) {
        navigateTo(`/event/${response.data.slug}`);
      } else {
        alert('Failed to update event, please try again later');
      }
    },
    [existingEvent, imageData, navigateTo]
  );

  return (
    <>
      {existingEvent && (
        <DeleteEventModal slug={existingEvent.slug}></DeleteEventModal>
      )}
      <ImageCropperModal
        imageData={imageData}
        updateImageData={updateImageData}
      ></ImageCropperModal>
      <DatePickerModal type="event-date" heading="Set event date" />
      <div className="bg-zinc-900">
        <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col  px-4">
          <Header logoText="inLive Event" logoHref="/event" />
          <main className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-5 lg:flex-row">
                <h2 className="flex-auto text-2xl font-bold text-zinc-100 lg:text-3xl">
                  {existingEvent
                    ? "Let's edit your event"
                    : "Let's create your event"}
                </h2>
                <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:border-0 lg:bg-transparent lg:p-0">
                  {existingEvent ? (
                    <div className="flex gap-4">
                      <div className="flex-auto lg:order-2">
                        <Button
                          type="submit"
                          data-action="update"
                          className="w-full min-w-0 rounded-lg bg-red-700 px-6 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500 lg:order-2 lg:w-auto"
                          isDisabled={isSubmitting}
                          aria-disabled={isSubmitting}
                          disabled={isSubmitting}
                        >
                          Update event
                        </Button>
                      </div>
                      <div className="lg:order-1">
                        <Button
                          className="w-full min-w-0 rounded-lg bg-zinc-800 px-3 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600 lg:order-1 lg:w-auto"
                          onPress={() => {
                            document.dispatchEvent(
                              new CustomEvent('open:event-delete-modal')
                            );
                          }}
                        >
                          <DeleteIcon width={24} height={24}></DeleteIcon>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex-1 lg:order-2">
                        <Button
                          type="submit"
                          data-action="publish"
                          className="w-full min-w-0 rounded-lg bg-red-700 px-6 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500 lg:w-auto"
                          isDisabled={isSubmitting}
                          aria-disabled={isSubmitting}
                          disabled={isSubmitting}
                        >
                          Publish event
                        </Button>
                      </div>
                      <div className="flex-1 lg:order-1">
                        <Button
                          type="submit"
                          data-action="save-as-draft"
                          className="w-full min-w-0 rounded-lg bg-zinc-800 px-6 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600 lg:w-auto"
                          isDisabled={isSubmitting}
                          aria-disabled={isSubmitting}
                          disabled={isSubmitting}
                        >
                          Save as draft
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-6 pb-28 lg:flex-row lg:pb-20">
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
                      className="block w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm shadow-sm  outline-none ring-1 ring-zinc-800 placeholder:text-zinc-400  focus-visible:ring-zinc-400"
                      type="text"
                      placeholder="Give your event a title"
                      autoComplete="off"
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
                      className="block min-h-60 w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm  shadow-sm outline-none ring-1 ring-zinc-800 placeholder:text-zinc-400  focus-visible:ring-zinc-400"
                      placeholder="Give a clear information about the event"
                      autoComplete="off"
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
                <div className="flex flex-1 flex-col gap-6">
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
                          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md bg-zinc-950 p-6 shadow-sm outline-none  ring-1 ring-zinc-800 hover:bg-zinc-950/40"
                          style={{ aspectRatio: '2/1' }}
                        >
                          <PhotoUploadIcon
                            width={48}
                            height={48}
                            className="text-zinc-400"
                          ></PhotoUploadIcon>
                          <p className="mt-3 text-sm font-medium text-zinc-400">
                            Click to add poster image
                          </p>
                          <p className="mt-1 text-xs text-zinc-200">
                            Support PNG, JPG, JPEG, WEBP
                          </p>
                          <p className="mt-1 text-xs text-zinc-200">
                            560 x 280. Aspect ratio 2:1
                          </p>
                          <input
                            id="file-input"
                            type="file"
                            className="hidden"
                            onChange={handleSelectImage}
                            accept="image/png, image/jpeg, image/webp"
                          />
                        </label>
                      </>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label
                        htmlFor="event-date"
                        className="mb-1 block text-sm font-medium text-zinc-200"
                      >
                        Event date
                      </label>
                      <div className="relative">
                        <input
                          id="event-date"
                          className="block w-full cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-sm  text-zinc-400 shadow-sm outline-none ring-1 ring-zinc-800"
                          type="text"
                          readOnly
                          onClick={() => {
                            document.dispatchEvent(
                              new CustomEvent('open:date-picker-modal', {
                                detail: {
                                  currentDate: eventDate,
                                },
                              })
                            );
                          }}
                          value={new Date(eventDate).toLocaleDateString(
                            'en-GB',
                            {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            }
                          )}
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-transparent text-zinc-400">
                          <CalendarIcon />
                        </span>
                      </div>
                    </div>
                  </div>
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
