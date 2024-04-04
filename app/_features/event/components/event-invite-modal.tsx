'use client';

import { generateID } from '@/(server)/_shared/utils/generateid';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

interface FormValues {
  emails: { email: string; id: string | undefined }[];
  csvEmails: string;
}

export default function EventInviteModal({ slug }: { slug: string }) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<FormValues>({
    defaultValues: {
      emails: [{ email: '', id: generateID(6) }],
      csvEmails: '',
    },
    mode: 'all',
  });

  const { control } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emails',
  });

  const OnSendEmails = useCallback(async () => {
    setIsSubmitting(true);
    console.log(methods.getValues('emails'));
    console.log(methods.formState);
    const emailForm = methods.getValues('emails');

    emailForm.forEach((email, idx) => {
      if (email.email === '') {
        remove(idx);
      }
    });

    const emails = emailForm.map((email) => email.email);
    try {
      const response = await fetch(`/api/events/${slug}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: emails }),
      });
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('An error occurred while sending emails');
    }
    setIsSubmitting(false);
    setErrorMessage('An error occurred while sending emails');
  }, [methods, onClose, remove, slug]);

  const onAddMultitpleEmails = useCallback(() => {
    const newEmails = methods.getValues('csvEmails').split(',');
    let existingEmails = methods
      .getValues('emails')
      .map((email) => email.email);

    // Check if existingEmails is empty or contains only one empty string
    if (existingEmails.length === 1 && existingEmails[0] === '') {
      remove(0);
      existingEmails = [];
    }

    newEmails.forEach((email) => {
      const emailTrimmed = email.trim();

      if (!existingEmails.includes(emailTrimmed)) {
        append({ email: emailTrimmed, id: generateID(6) });
      }
    });

    methods.resetField('csvEmails');
  }, [append, methods, remove]);

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const closeModal = useCallback(() => {
    methods.reset();
    onClose();
  }, [methods, onClose]);

  useEffect(() => {
    document.addEventListener('open:event-invite-modal', openModal);
  });

  return (
    <FormProvider {...methods}>
      <form>
        <Modal isOpen={isOpen} onClose={closeModal} onOpenChange={onOpenChange}>
          <ModalContent>
            <ModalHeader>
              <h2>Invite Participants</h2>
            </ModalHeader>
            <ModalBody className="flex flex-col gap-2">
              {errorMessage && (
                <p className="bg-red-900/25 px-4 py-3 text-xs font-medium text-red-300">
                  {errorMessage}
                </p>
              )}

              <div>
                <textarea
                  className="block w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm shadow-sm  outline-none ring-1 ring-zinc-800 placeholder:text-zinc-400  focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-800"
                  placeholder="Quickly add multiple emails separated by commas"
                  {...methods.register('csvEmails', {
                    pattern:
                      /^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\s*,\s*)*[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  })}
                />
                {methods.formState.errors.csvEmails && (
                  <p className="mx-1 mt-1 text-xs font-medium text-red-400">
                    Invalid email address. please make sure to separate emails
                    by commas.
                  </p>
                )}
                <Button
                  isDisabled={
                    methods.formState.errors.csvEmails !== undefined ||
                    methods.getValues('csvEmails') === ''
                  }
                  className="mt-2 w-full rounded-md  bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600"
                  onClick={onAddMultitpleEmails}
                >
                  Add emails
                </Button>
              </div>

              <Divider className="mt-2" />

              <div className="flex max-h-[24rem] flex-col overflow-x-auto overflow-y-scroll p-1">
                {fields.map((email, index) => (
                  <div key={email.id} className="mt-2">
                    <div key={email.id} className="flex w-full flex-row gap-2">
                      <input
                        className="block w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm shadow-sm  outline-none ring-1 ring-zinc-800 placeholder:text-zinc-400  focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-800"
                        type="email"
                        placeholder={`Email ${index + 1}`}
                        {...methods.register(`emails.${index}.email`, {
                          required: true,
                          pattern:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        })}
                      />

                      {index !== 0 && (
                        <Button
                          isIconOnly
                          className="flex  items-center  rounded-lg bg-zinc-800  hover:bg-zinc-700 active:bg-zinc-600"
                          onClick={() => remove(index)}
                        >
                          <XFillIcon height={12} width={12} />
                        </Button>
                      )}
                    </div>
                    {methods.formState.errors.emails?.[index]?.email?.type ===
                      'pattern' && (
                      <p className="mx-1 mt-1 text-xs font-medium text-red-400">
                        Invalid email address.
                      </p>
                    )}
                    {methods.formState.errors.emails?.[index]?.email?.type ===
                      'required' && (
                      <p className="mx-1 mt-1 text-xs font-medium text-red-400">
                        Remove empty email field before sending.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="flex  w-full items-center  rounded-md bg-zinc-800  hover:bg-zinc-700 active:bg-zinc-600"
                onClick={() => append({ email: '', id: generateID(6) })}
              >
                Add receipient
              </Button>
              <Button
                className="w-full rounded-md bg-red-700  text-base font-medium text-white antialiased hover:bg-red-600 active:bg-red-500 lg:text-sm"
                type="submit"
                isDisabled={isSubmitting}
                onClick={OnSendEmails}
              >
                Send emails
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </form>
    </FormProvider>
  );
}
