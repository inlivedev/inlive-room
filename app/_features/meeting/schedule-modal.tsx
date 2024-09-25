'use client';

import { useEffect, useState } from 'react';
import MeetingScheduleForm from '@/_features/meeting/schedule-form';
import { AnimatePresence, motion } from 'framer-motion';

export default function ScheduleModal() {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
  });

  const [isOpen, setIsOpen] = useState(false); // New state for modal visibility

  useEffect(() => {
    // Handler to update the screen size
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
      });
    };

    // Add event listener for screen resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const openModal = () => {
      setIsOpen(true); // Set modal to open
    };

    document.addEventListener('open:schedule-meeting-modal', openModal);
    document.addEventListener('close:schedule-meeting-modal', () => {
      setIsOpen(false); // Set modal to close
    });

    document.addEventListener('open:schedule-meeting-modal-detail', () => {
      openModal();
    });

    return () => {
      document.removeEventListener('open:schedule-meeting-modal', openModal);
      document.removeEventListener('close:schedule-meeting-modal', () => {
        setIsOpen(false);
      });
    };
  }, [screenSize.width]);

  return (
    <>
      {isOpen && (
        <div className="invisible absolute left-0 top-0 z-20 h-[100vh] w-[100vw] bg-black/50 sm:visible"></div>
      )}
      {isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
          >
            <div
              className={`fixed inset-0 z-50 h-full w-full rounded-md bg-zinc-900 p-4 sm:left-1/2 sm:top-1/2 sm:h-fit sm:w-fit sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2`}
            >
              <MeetingScheduleForm></MeetingScheduleForm>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
