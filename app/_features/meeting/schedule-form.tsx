'use client';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useCallback, useState } from 'react';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import DatePicker from 'react-datepicker';
import '../event/styles/date-picker.css';
import { generateID } from '@/(server)/_shared/utils/generateid';
import MailPlus from '@/_shared/components/icons/mail-plus-icon';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';

export default function MeetingScheduleForm() {
  const today = new Date();
  const startTime = new Date();

  startTime.setMinutes(0, 0, 0);
  const endTime = new Date(startTime.getTime());
  endTime.setHours(startTime.getHours() + 1);
  endTime.setMinutes(0, 0, 0);

  const { register, setValue, control, formState, getValues, resetField } =
    useForm<{
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      csvEmails: string;
      emails: { email: string; id: string | undefined }[];
    }>({
      defaultValues: {
        date: parseDateToString(today),
        startTime: parseTimeDateToString(startTime),
        endTime: parseTimeDateToString(endTime),
        csvEmails: '',
        emails: [],
      },
      mode: 'all',
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emails',
  });

  const onAddMultitpleEmails = useCallback(() => {
    const regex =
      /^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\s*,\s*)*[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    const newEmails = getValues('csvEmails');

    if (!regex.test(newEmails)) {
      return;
    }

    const regexEmails = newEmails.split(',');
    let existingEmails = getValues('emails').map((email) => email.email);

    // Check if existingEmails is empty or contains only one empty string
    if (existingEmails.length === 1 && existingEmails[0] === '') {
      remove(0);
      existingEmails = [];
    }

    regexEmails.forEach((email) => {
      const emailTrimmed = email.trim();

      if (!existingEmails.includes(emailTrimmed)) {
        append({ email: emailTrimmed, id: generateID(6) });
      }
    });

    resetField('csvEmails');
  }, [append, getValues, remove, resetField]);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  return (
    <div>
      <form className="flex flex-col gap-2">
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Meeting Title"
            className="block w-full cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 shadow-sm outline-none ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800"
          />
        </div>

        <label>Time</label>

        <div className="flex flex-row flex-wrap gap-2">
          {/* datepicker form */}
          <div className="relative flex w-full flex-row items-center justify-center bg-zinc-950 outline-none ring-1 ring-zinc-800">
            <Popover
              placement="bottom"
              shouldCloseOnInteractOutside={(e) => {
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
                      console.log(date);
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
              className="z-10 block flex-1 cursor-pointer rounded-md bg-transparent py-2.5 pl-4 pr-9 text-sm  text-zinc-400 shadow-sm  outline-none disabled:cursor-not-allowed disabled:bg-zinc-800"
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
              className="bg-trasnparent r-2 z-10 w-5 flex-none text-zinc-400"
              onClick={(e) => {
                setIsEndTimeOpen(false);
                setIsStartTimeOpen(false);
                setIsDatePickerOpen(!isDatePickerOpen);
              }}
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* timepicker form */}
          <div className="relative flex flex-1 items-center justify-center">
            <Popover
              placement="bottom"
              shouldCloseOnInteractOutside={(e) => {
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
              className="block w-full flex-1 cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-sm  text-zinc-400 shadow-sm outline-none ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800"
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
              shouldCloseOnInteractOutside={(e) => {
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
              className="block w-full flex-1 cursor-pointer rounded-md bg-zinc-950 py-2.5 pl-4 pr-9 text-sm  text-zinc-400 shadow-sm outline-none ring-1 ring-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-800"
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
          <div className="relative flex w-full flex-row items-center rounded-md bg-zinc-950 outline-none ring-1 ring-zinc-800 sm:w-auto">
            <input
              className="flex-1 bg-transparent py-2.5 pl-4 text-sm outline-none"
              placeholder="Add multiple email by comma"
              id="email"
              {...register('csvEmails', {
                pattern:
                  /^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\s*,\s*)*[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddMultitpleEmails();
                }
              }}
            />
            <Button
              isDisabled={
                formState.errors.csvEmails !== undefined ||
                getValues('csvEmails') === ''
              }
              className="
                rounded-none bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600
              "
              onClick={onAddMultitpleEmails}
              isIconOnly
            >
              <MailPlus className=" text-white" width={20} height={20} />
            </Button>
          </div>
          {formState.errors.csvEmails && (
            <p className="mx-1 mt-1 text-xs font-medium text-red-400">
              Invalid email address. please make sure to separate emails by
              commas.
            </p>
          )}
        </div>

        {fields.length > 0 && (
          <div className="max-h-60 overflow-x-hidden overflow-y-scroll rounded-md ring-1 ring-zinc-800">
            <table className="w-full rounded-md ">
              <tbody className="">
                {fields.map((email, index) => (
                  <tr
                    key={email.id}
                    className="
          odd:bg-zinc-800 even:bg-zinc-900 hover:bg-red-800"
                  >
                    <td className="flex flex-row items-center p-2 text-sm">
                      <p className="flex-1">{email.email}</p>
                    </td>
                    <td>
                      <span
                        className="cursor-pointer"
                        onClick={() => remove(index)}
                      >
                        <XFillIcon height={12} width={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-row gap-2">
          <Button
            onPress={() => {
              document.dispatchEvent(
                new CustomEvent('close:schedule-meeting-modal')
              );
            }}
            className="w-full rounded-md bg-zinc-800  text-base font-medium text-white antialiased hover:bg-red-600 active:bg-red-500 lg:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full rounded-md bg-red-700  text-base font-medium text-white antialiased hover:bg-red-600 active:bg-red-500 lg:text-sm"
          >
            Schedule
          </Button>
        </div>
      </form>
    </div>
  );
}

function parseDateToString(date: Date) {
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

function parseTimeDateToString(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}
