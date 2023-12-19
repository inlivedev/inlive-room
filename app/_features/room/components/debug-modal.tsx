'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from '@nextui-org/react';

export default function DebugModal() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const onCloseModal = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('open:debug-modal', openModal);

    return () => {
      document.removeEventListener('open:debug-modal', openModal);
    };
  }, [openModal]);

  return (
    <Modal
      size="sm"
      backdrop="transparent"
      placement="center"
      isOpen={isOpen}
      onClose={() => onCloseModal()}
      onOpenChange={onOpenChange}
    >
      <ModalContent className="ring-1 ring-zinc-800">
        <ModalBody className="p-0">
          <DebugInformation />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function NetworkInformation() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Resolution</b>
        <p className="text-sm text-zinc-200">1280x720</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">
          Frames per seconds
        </b>
        <p className="text-sm text-zinc-200">30</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">
          Quality limitation reason
        </b>
        <p className="text-sm capitalize text-zinc-200">none</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">
          Available Outgoing Bitrate
        </b>
        <p className="text-sm text-zinc-200">Active</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Bitrate</b>
        <p className="text-sm text-zinc-200">500</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Jitter</b>
        <p className="text-sm text-zinc-200">500</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Packet lost</b>
        <p className="text-sm text-zinc-200">500</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Fraction lost</b>
        <p className="text-sm text-zinc-200">500</p>
      </div>
    </div>
  );
}

function StreamInformation() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Client ID</b>
        <p className="text-sm text-zinc-200">123fghjkl</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Client name</b>
        <p className="text-sm text-zinc-200">guest-12345</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Source</b>
        <p className="text-sm text-zinc-200">Media</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Origin</b>
        <p className="text-sm text-zinc-200">Remote</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Audio track</b>
        <p className="text-sm text-zinc-200">Active</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <b className="text-xs font-semibold text-zinc-400">Camera track</b>
        <p className="text-sm text-zinc-200">Muted</p>
      </div>
    </div>
  );
}

function DebugInformation() {
  const [activeTab, setActiveTab] = useState<'stream' | 'network'>('stream');

  return (
    <div className="bg-zinc-800 px-5 py-6">
      <div className="mb-4 flex items-center gap-4 border-b border-zinc-700">
        <div>
          <button
            className="relative pb-2.5"
            onClick={() => setActiveTab('stream')}
          >
            <div
              className={`text-sm font-semibold ${
                activeTab === 'stream' ? 'text-zinc-200' : 'text-zinc-400'
              }`}
            >
              Stream
            </div>
            {activeTab === 'stream' && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white"></div>
            )}
          </button>
        </div>
        <div>
          <button
            className="relative pb-2.5"
            onClick={() => setActiveTab('network')}
          >
            <div
              className={`text-sm font-semibold ${
                activeTab === 'network' ? 'text-zinc-200' : 'text-zinc-400'
              }`}
            >
              Network
            </div>
            {activeTab === 'network' && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white"></div>
            )}
          </button>
        </div>
      </div>
      {activeTab === 'stream' && <StreamInformation />}
      {activeTab === 'network' && <NetworkInformation />}
    </div>
  );
}
