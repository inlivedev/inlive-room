'use client';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from '@nextui-org/react';
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useCallback, useState, useEffect, KeyboardEvent } from 'react';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import DatePicker from 'react-datepicker';
import '@/_shared/styles/date-picker.css';
import { generateID } from '@/(server)/_shared/utils/generateid';

import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import { useAuthContext } from '@/_shared/contexts/auth';
import { FetcherResponse, InternalApiFetcher } from '@/_shared/utils/fetcher';
import {
  EventDetails,
  EventParticipant,
} from '@/(server)/_features/event/service';
import Link from 'next/link';
import CopyIcon from '@/_shared/components/icons/copy-icon';
import { SVGElementPropsType } from '@/_shared/types/types';

type Email = {
  address: string;
  id: string | undefined;
  name: string | undefined;
};

type InputsType = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  emails: Email[];
  emailInput: string;
};

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;
const ENABLE_EDIT_MEETING =
  process.env.NEXT_PUBLIC_ENABLE_EDIT_MEETING == 'true';

export default function MeetingScheduleForm() {
  const [existingEvent, setExistingEvent] = useState<
    undefined | EventDetails
  >();

  const [existingParticipants, setExistingParticipants] = useState<
    undefined | EventParticipant[]
  >();

  const [enableResceduleButton, setEnableRescheduleButton] = useState(true);

  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { user } = useAuthContext();
  const today = new Date();
  const startTime = new Date();

  startTime.setMinutes(0, 0, 0);
  const endTime = new Date(startTime.getTime());
  endTime.setHours(startTime.getHours() + 1);
  endTime.setMinutes(0, 0, 0);

  const [formData, setFormData] = useState<{
    event: EventDetails;
    participants: EventParticipant[] | undefined;
  } | null>(null);

  const [editMode, setEditMode] = useState<boolean>(true);

  const {
    register,
    setValue,
    control,
    setError,
    clearErrors,
    getValues,
    handleSubmit,
    reset,
  } = useForm<InputsType>({
    defaultValues: {
      date: parseDateToString(today),
      startTime: parseTimeDateToString(startTime),
      endTime: parseTimeDateToString(endTime),
      emails: [],
      title: user ? user.name + ' Meeting' : '',
    },
    mode: 'all',
  });

  const [displayError, setDisplayError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const onSubmit: SubmitHandler<InputsType> = async (data, e) => {
    const submitEvent = e as React.SyntheticEvent<HTMLFormElement, SubmitEvent>;
    const submitter = submitEvent.nativeEvent.submitter;

    if (submitter && !isSubmitting) {
      setIsSubmitting(true);
      setDisplayError(true);

      const startTime = parseStringDateToDate(data.date);
      startTime.setHours(parseTimeStringToDate(data.startTime).getHours());
      startTime.setMinutes(parseTimeStringToDate(data.startTime).getMinutes());

      const endTime = parseStringDateToDate(data.date);
      endTime.setHours(parseTimeStringToDate(data.endTime).getHours());
      endTime.setMinutes(parseTimeStringToDate(data.endTime).getMinutes());

      const bodyData = {
        title: data.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: '',
        status: 'published',
        type: 'meeting',
        maximumSlots: data.emails.length,
        emails: data.emails.map((email) => email.address),
      };

      if (existingEvent) {
        InternalApiFetcher.put(`/api/scheduled-meeting/${existingEvent.id}`, {
          body: JSON.stringify(bodyData),
          headers: undefined,
        })
          .then(
            (
              val: FetcherResponse & {
                data: {
                  event: EventDetails;
                  participants: EventParticipant[];
                };
              }
            ) => {
              if (!val.ok) {
                setErrorMessage(
                  'Failed to update the meeting please try again later'
                );
              } else {
                reset();
                setExistingEvent(val.data.event);
                setEditMode(false);
                setExistingParticipants(
                  val.data.participants.filter(
                    (val) => val.user.email != user?.email
                  )
                );
              }
            }
          )
          .finally(() => {
            setIsSubmitting(false);
          });
      } else {
        InternalApiFetcher.post('/api/scheduled-meeting', {
          body: JSON.stringify(bodyData),
          headers: undefined,
        }).then(
          (
            val: FetcherResponse & {
              data: {
                event: EventDetails;
                participants: EventParticipant[];
              };
            }
          ) => {
            if (!val.ok) {
              setErrorMessage(
                'Failed to create meeting please try again later'
              );
            }

            if (val.ok) {
              reset();
              setExistingEvent(val.data.event);
              setEditMode(false);
              setExistingParticipants(
                val.data.participants.filter(
                  (val) => val.user.email != user?.email
                )
              );
            }
          }
        );

        setIsSubmitting(false);
      }
    }
  };

  register('emails', {
    required: 'Please add at least one email address',
    validate: (emails) => emails.length > 0,
  });

  const selectedDate = parseStringDateToDate(
    useWatch({ control, name: 'date' })
  );

  const selectedStartTime = parseTimeStringToDate(
    useWatch({ control, name: 'startTime' })
  );

  const selectedEndTime = parseTimeStringToDate(
    useWatch({ control, name: 'endTime' })
  );

  const selectedEmails = useWatch({ control, name: 'emails' });

  const fillForm = useCallback(
    (
      e: CustomEvent<{ event: EventDetails; participants: EventParticipant[] }>
    ) => {
      setEditMode(false);
      setExistingEvent(e.detail.event);

      e.detail.participants = e.detail.participants.filter(
        (val) => val.user.email != user?.email
      );

      setExistingParticipants(e.detail.participants);
    },
    [user?.email]
  );

  document.addEventListener('edit:schedule-meeting', fillForm as EventListener);

  useEffect(() => {
    return () => {
      document.removeEventListener(
        'edit:schedule-meeting',
        fillForm as EventListener
      );
    };
  }, [fillForm]);

  useEffect(() => {
    if (formData) {
      const { event, participants } = formData;
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);

      setValue('date', parseDateToString(startTime));
      setValue('startTime', parseTimeDateToString(startTime));
      setValue('endTime', parseTimeDateToString(endTime));
      setValue('title', event.name);
      if (participants) {
        setValue(
          'emails',
          participants.map((p) => ({
            address: p.user.email,
            id: p.user.email,
            name: p.user.name,
          }))
        );
      }
    }
  }, [formData, setValue, user?.email]);

  useEffect(() => {
    if (existingEvent) {
      setEnableRescheduleButton(false);
    }
  }, [existingEvent]);

  function cancelEdit() {
    setEditMode(false);
    setEnableRescheduleButton(false);
  }

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  // Email Input Chips Component
  const {
    fields: emails,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'emails',
  });

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const parseEmail = (input: string): Email | null => {
    const match = input.match(/^(?:(.+?)\s*<(.+@.+)>|(.+@.+))$/);
    if (match) {
      if (match[3]) {
        return { name: undefined, address: match[3], id: generateID() };
      } else {
        return { name: match[1], address: match[2], id: generateID() };
      }
    }
    return null;
  };

  const addEmail = (input: string) => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      const emailData = parseEmail(trimmedInput);
      if (emailData && validateEmail(emailData.address)) {
        const emailList = getValues('emails');

        if (!emailList.some((email) => email.address === emailData.address)) {
          append(emailData);
        } else {
          setError('emailInput', {
            type: 'manual',
            message: `Email ${emailData.address} is already in the list`,
          });
        }
        setValue('emailInput', '');
        clearErrors('emailInput');
      } else {
        setError('emailInput', {
          type: 'manual',
          message: `Invalid email format: ${trimmedInput}`,
        });
      }
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(getValues('emailInput'));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedEmails = pastedText.split(/,\s*/);
    pastedEmails.forEach((email) => {
      const trimmedEmail = email.trim();
      if (trimmedEmail) {
        addEmail(trimmedEmail);
      }
    });
  };

  return (
    <div className="h-full">
      <div className={editMode ? 'hidden' : `flex flex-col gap-8 p-1`}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between py-4">
            <h2 className="text-large font-semibold">
              {(() => {
                switch (existingEvent?.category?.name) {
                  case 'webinar':
                    return 'Webinar Details';
                  case 'meetings':
                    return 'Scheduled meeting Details';
                  default:
                    return 'Event Details';
                }
              })()}
            </h2>
            <button
              onClick={() => {
                document.dispatchEvent(
                  new CustomEvent('close:schedule-meeting-modal')
                );
              }}
            >
              <XFillIcon width={14} height={14}></XFillIcon>
            </button>
          </div>

          <div className="flex w-full flex-row items-center justify-between rounded-md p-2 text-xs ring-1 ring-zinc-700">
            {APP_ORIGIN}/rooms/{existingEvent?.roomId}
            <Button
              onPress={() => {
                navigator.clipboard
                  .writeText(`${APP_ORIGIN}/rooms/${existingEvent?.roomId}`)
                  .then(() => {
                    setCopySuccess(true);

                    setTimeout(() => {
                      setCopySuccess(false);
                    }, 1500);
                  });
              }}
              isIconOnly
              className="h-5 w-5 bg-transparent p-0"
            >
              {!copySuccess && (
                <CopyIcon className="h-5 w-5" width={20} height={20} />
              )}
              {copySuccess && (
                <CheckIcon className="h-5 w-5" width={20} height={20} />
              )}
            </Button>
          </div>

          <div className="flex flex-row gap-2">
            <Button
              as={Link}
              href={`
            ${APP_ORIGIN}/rooms/${existingEvent?.roomId}
            `}
              className="flex h-9  w-fit min-w-0 basis-1/2 items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-medium antialiased hover:bg-red-600 active:bg-red-500"
            >
              Go to Meeting Room
            </Button>

            {existingEvent?.category?.name == 'webinar' && (
              <>
                {existingEvent.createdBy == user?.id ? (
                  <Button
                    as={Link}
                    href={`
            ${APP_ORIGIN}/webinars/${existingEvent?.slug}
            `}
                    className="flex h-9  w-fit min-w-0 basis-1/2 items-center gap-2 rounded-md bg-zinc-700 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-600 active:bg-zinc-500"
                  >
                    Edit Webinar
                  </Button>
                ) : (
                  <Button
                    as={Link}
                    href={`
          ${APP_ORIGIN}/webinars/${existingEvent?.slug}/edit
          `}
                    className="flex h-9  w-fit min-w-0 basis-1/2 items-center gap-2 rounded-md bg-zinc-700 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-600 active:bg-zinc-500"
                  >
                    Go to Webinar Page
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-sm">
          <p className=" font-bold">{existingEvent?.name} </p>
          <div className="text-zinc-300">
            {existingEvent && (
              <div>
                <p>{parseDateToString(new Date(existingEvent.startTime))}</p>
                <p>
                  {parseTimeDateToString(
                    new Date(existingEvent.startTime),
                    true
                  )}{' '}
                  -{' '}
                  {parseTimeDateToString(new Date(existingEvent.endTime), true)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm">
          <p className="font-semibold">Host</p>
          <p>
            {existingEvent?.host?.name} -{' '}
            <span className="text-zinc-400">{existingEvent?.host?.email}</span>
          </p>
        </div>

        {existingParticipants && existingParticipants.length > 0 && (
          <div className="text-sm">
            <p className="font-semibold">Participants</p>
            {(() => {
              return (
                <>
                  {existingParticipants.slice(0, 3).map((val) => (
                    <p key={val.user.email}>
                      {val.user.name} -{' '}
                      <span className="text-zinc-400">{val.user.email}</span>
                    </p>
                  ))}
                  {existingParticipants.length > 3 && (
                    <p
                      className="cursor-pointer text-red-500 hover:underline"
                      onClick={() =>
                        setShowAllParticipants(!showAllParticipants)
                      }
                    >
                      {showAllParticipants
                        ? 'Show less'
                        : `+${existingParticipants.length - 3} more`}
                    </p>
                  )}
                  {showAllParticipants &&
                    existingParticipants.slice(3).map((val) => (
                      <p key={val.user.email}>
                        {val.user.name} -{' '}
                        <span className="text-zinc-400">{val.user.email}</span>
                      </p>
                    ))}
                </>
              );
            })()}
          </div>
        )}

        {existingEvent?.createdBy == user?.id &&
          existingEvent?.category?.name == 'meetings' && (
            <div className="pb-safe fixed bottom-0 right-0 flex w-full gap-2 border-t border-zinc-700  p-2 sm:relative sm:border-none sm:p-0">
              <Button
                disabled
                className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600 disabled:bg-zinc-950 disabled:text-zinc-500"
              >
                Cancel schedule
              </Button>
              <Button
                disabled={!ENABLE_EDIT_MEETING}
                className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600 disabled:bg-zinc-950 disabled:text-zinc-500"
                onPress={() => {
                  if (ENABLE_EDIT_MEETING) {
                    setFormData({
                      event: existingEvent,
                      participants: existingParticipants,
                    });
                    setEditMode(true);
                    setTimeout(() => {
                      setEnableRescheduleButton(true);
                    }, 1500);
                  }
                }}
              >
                Edit schedule
              </Button>
            </div>
          )}
      </div>

      <form
        className={editMode ? `flex flex-col gap-2` : 'hidden'}
        id="scheduleForm"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission on 'Enter'
          }
        }}
      >
        <div className="mx-2 flex flex-row justify-between py-4">
          <div>
            <h2 className="text-large font-semibold">Schedule a Meeting</h2>
            <p className="text-sm font-normal text-zinc-400">
              Send a personal email to schedule a meeting
            </p>
          </div>
          <button
            onClick={() => {
              document.dispatchEvent(
                new CustomEvent('close:schedule-meeting-modal')
              );
            }}
          >
            <XFillIcon width={14} height={14}></XFillIcon>
          </button>
        </div>
        <div className="m-2 flex max-h-dvh flex-col gap-2 overflow-y-auto overflow-x-hidden sm:max-h-max">
          {selectedEmails.length < 1 && displayError && (
            <p className="rounded-md bg-red-700/50 p-2 text-xs text-red-200">
              Please input atleast one email address
            </p>
          )}

          {displayError && errorMessage && (
            <p className="rounded-md bg-red-700/50 p-2 text-xs text-red-200">
              {errorMessage}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Meeting Title"
              className="mx-1 block cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-base shadow-sm outline-none ring-1 ring-zinc-800 focus-within:ring-red-500 disabled:cursor-not-allowed disabled:bg-zinc-800"
              {...register('title')}
            />
          </div>

          <label>Time</label>

          <div className="flex flex-row flex-wrap gap-2">
            {/* datepicker form */}
            <div className="relative mx-1 flex w-full flex-row items-center justify-center rounded-md bg-zinc-950 outline-none ring-1 ring-zinc-800">
              <Popover
                placement="bottom"
                shouldCloseOnInteractOutside={() => {
                  return false;
                }}
                isOpen={isDatePickerOpen}
              >
                <PopoverTrigger>
                  <p className="absolute inset-0 -z-10"></p>
                </PopoverTrigger>
                <PopoverContent className="inset max-h-[340px] max-w-[400px] flex-none rounded-md p-2">
                  {/* content */}
                  <DatePicker
                    selected={new Date(selectedDate)}
                    onChange={(date) => {
                      if (date) {
                        setValue('date', parseDateToString(date));
                        setIsDatePickerOpen(false);
                      }
                    }}
                    inline
                  />
                </PopoverContent>
              </Popover>
              <input
                id="event-date"
                className="z-10 mx-1 block flex-1 cursor-pointer rounded-md bg-transparent py-2.5 pl-4 pr-9 text-base shadow-sm outline-none  focus-within:ring-red-500 disabled:cursor-not-allowed disabled:bg-zinc-800"
                type="text"
                {...register('date')}
                onClick={() => {
                  setIsEndTimeOpen(false);
                  setIsStartTimeOpen(false);
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
              />
              <Button
                isIconOnly
                className="r-2 z-10 w-5 flex-none bg-transparent text-zinc-400"
                onClick={() => {
                  setIsEndTimeOpen(false);
                  setIsStartTimeOpen(false);
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
              >
                <CalendarIcon className="size-5" />
              </Button>
            </div>

            {/* timepicker form */}
            <div className="relative flex flex-1 items-center justify-center">
              <Popover
                placement="bottom"
                shouldCloseOnInteractOutside={() => {
                  return false;
                }}
                isOpen={isStartTimeOpen}
                className="hidden sm:block"
              >
                <PopoverTrigger>
                  <p className="absolute inset-0 -z-10"></p>
                </PopoverTrigger>
                <PopoverContent className="inset-0 max-h-[340px] w-full max-w-[400px] flex-none rounded-md p-2">
                  {/* content */}
                  <DatePicker
                    selected={selectedStartTime}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeFormat="HH:mm"
                    onChange={(date) => {
                      if (date) {
                        setValue('startTime', parseTimeDateToString(date));
                        setIsStartTimeOpen(false);
                      }
                    }}
                    inline
                  />
                </PopoverContent>
              </Popover>
              <input
                id="time"
                className="mx-1 block w-full flex-1 cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-base shadow-sm outline-none ring-1 ring-zinc-800 focus-within:ring-red-500 disabled:cursor-not-allowed disabled:bg-zinc-800"
                type="time"
                onClick={() => {
                  setIsDatePickerOpen(false);
                  setIsEndTimeOpen(false);
                  setIsStartTimeOpen(!isStartTimeOpen);
                }}
                {...register('startTime')}
              />
            </div>

            {/* timepicker form */}
            <div className="relative flex flex-1 items-center justify-center">
              <Popover
                placement="bottom"
                shouldCloseOnInteractOutside={() => {
                  return false;
                }}
                isOpen={isEndTimeOpen}
                className="hidden sm:block"
              >
                <PopoverTrigger>
                  <p className="absolute inset-0 -z-10"></p>
                </PopoverTrigger>
                <PopoverContent className="inset-0 max-h-[340px] w-full max-w-[400px] flex-none rounded-md p-2">
                  {/* content */}
                  <DatePicker
                    selected={selectedEndTime}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    excludeTimes={[startOfDay, selectedStartTime]}
                    timeFormat="HH:mm"
                    onChange={(date) => {
                      if (date) {
                        setValue('endTime', parseTimeDateToString(date));
                        setIsEndTimeOpen(false);
                      }
                    }}
                    inline
                  />
                </PopoverContent>
              </Popover>
              <input
                id="time"
                className="mx-1 block w-full flex-1 cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-base shadow-sm outline-none ring-1 ring-zinc-800 focus-within:ring-red-500 disabled:cursor-not-allowed disabled:bg-zinc-800"
                type="time"
                onClick={() => {
                  setIsDatePickerOpen(false);
                  setIsStartTimeOpen(false);
                  setIsEndTimeOpen(!isEndTimeOpen);
                }}
                {...register('endTime')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <div className="mx-1 flex flex-wrap items-center rounded-md bg-zinc-950 p-2 ring-1 ring-zinc-800 focus-within:ring-1 focus-within:ring-red-500">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className="m-1 flex items-center rounded-md bg-zinc-300 px-3 py-1 text-sm text-zinc-800"
                >
                  <span>
                    {email.name
                      ? `${email.name} <${email.address}>`
                      : email.address}
                  </span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      remove(index);
                    }}
                    className="ml-2 focus:outline-none"
                    aria-label="Remove email"
                  >
                    <XFillIcon width={14} height={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                onKeyDown={handleInputKeyDown}
                onPaste={handlePaste}
                className="min-w-[200px] grow border-none bg-zinc-950 focus:outline-none"
                placeholder="Enter email addresses"
                {...register('emailInput')}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter email addresses separated by commas. Valid formats:
              email@domain.com or User Name &lt;email@domain.com&gt;
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 right-0 flex w-full gap-2 border-t border-zinc-700  p-2 sm:relative sm:border-none sm:p-0">
          <Button
            onPress={() => {
              reset();
              {
                formData
                  ? cancelEdit()
                  : document.dispatchEvent(
                      new CustomEvent('close:schedule-meeting-modal')
                    );
              }
            }}
            className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="scheduleForm"
            className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium antialiased hover:bg-red-600 active:bg-red-500"
            isDisabled={isSubmitting || !enableResceduleButton}
          >
            {isSubmitting ? (
              <div className="flex gap-2">
                <Spinner
                  classNames={{
                    circle1: 'border-b-zinc-200',
                    circle2: 'border-b-zinc-200',
                    wrapper: 'w-4 h-4',
                  }}
                />
                <span>{existingEvent ? 'Rescheduling' : 'Scheduling'}</span>
              </div>
            ) : (
              <span>{existingEvent ? 'Reschedule' : 'Schedule'}</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function parseDateToString(date?: Date) {
  const eventTime = Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);

  return eventTime;
}

function parseStringDateToDate(timeString: string): Date {
  try {
    // Create a DateTimeFormat object for parsing
    const formatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

    // Use the formatToParts method to break the time string into parts
    const parts = formatter.formatToParts(new Date(timeString));

    // Extract the individual components
    const day = +parts.find((part) => part.type === 'day')!.value;
    const month = parts.find((part) => part.type === 'month')!.value;
    const year = +parts.find((part) => part.type === 'year')!.value;

    // Create a new Date object with the parsed date
    const date = new Date(
      year,
      new Date(Date.parse(month + ' 1, 2012')).getMonth(),
      day
    );

    return date;
  } catch (error) {
    // If an error occurs, return the current date
    return new Date();
  }
}

function parseTimeStringToDate(time: string): Date {
  try {
    // Check if the time string is in a valid format
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      throw new Error('Invalid time format');
    }

    // Split the time string into hours and minutes
    const [hours, minutes] = time.split(':').map(Number);

    // Create a new Date object and set the hours and minutes
    const date = new Date();
    date.setHours(hours, minutes);

    return date;
  } catch (error) {
    // If an error occurs, return the current date
    return new Date();
  }
}

function parseTimeDateToString(date?: Date, AM = false) {
  if (!date) {
    return '';
  }

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  let period = '';

  if (AM) {
    period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
  }

  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`.trim();
}

function CheckIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
      <path
        fill="currentColor"
        d="M104 196a12.2 12.2 0 0 1-8.5-3.5l-56-56a12 12 0 0 1 17-17L104 167L207.5 63.5a12 12 0 0 1 17 17l-112 112a12.2 12.2 0 0 1-8.5 3.5Z"
      />
    </svg>
  );
}
