'use client';

import { useCallback, useState } from 'react';
import { Button } from '@nextui-org/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import type { EventType } from '@/_shared/types/event';
import DeleteIcon from '@/_shared/components/icons/delete-icon';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';

type InputsType = {
  eventTitle: string;
  eventDescription: string;
  eventDate: Date;
  eventStartTime: Date;
  eventEndTime: Date;
};

export default function EventForm({
  data: existingEvent,
}: {
  data?: EventType.Event;
}) {
  const { user } = useAuthContext();
  const { navigateTo } = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputsType>({
    mode: 'onTouched',
  });

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

      if (action === 'publish') {
        await createEvent({
          eventTitle: data.eventTitle,
          eventDescription: data.eventDescription,
          host: user.name,
          startTime: new Date(),
          endTime: new Date(),
          publish: true,
        });
      } else if (action === 'save-as-draft') {
        await createEvent({
          eventTitle: data.eventTitle,
          eventDescription: data.eventDescription,
          host: user.name,
          startTime: new Date(),
          endTime: new Date(),
          publish: false,
        });
      } else if (action === 'update') {
        //
      }

      setIsSubmitting(false);
    }
  };

  const createEvent = useCallback(
    async ({
      eventTitle,
      eventDescription,
      host,
      startTime,
      endTime,
      publish = false,
    }: {
      eventTitle: string;
      eventDescription: string;
      host: string;
      startTime: Date;
      endTime: Date;
      publish: boolean;
    }) => {
      const data = {
        name: eventTitle,
        description: eventDescription.replace(/(?:\r\n|\r|\n)/g, '<br>'),
        isPublished: publish,
        host: host,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const formData = new FormData();

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

  return (
    <>
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
                      {...register('eventTitle', {
                        required: true,
                        value: existingEvent?.name || '',
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
                      {...register('eventDescription', {
                        required: true,
                        value: existingEvent?.description || '',
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
                <div className="flex flex-1 flex-col gap-6"></div>
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
