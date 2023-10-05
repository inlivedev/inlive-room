import { createStream } from './stream';
import { createStreams } from './streams';

export type CreateStream = typeof createStream;
export type CreateStreams = typeof createStreams;

export type InstanceStream = ReturnType<
  ReturnType<CreateStream>['createInstance']
>;
export type InstanceStreams = ReturnType<
  ReturnType<CreateStreams>['createInstance']
>;

export type StreamParams = {
  id: string;
  clientId: string;
  name: string;
  origin: 'local' | 'remote';
  source: 'media' | 'screen';
  mediaStream: MediaStream;
};

export type AddStreamParams = Omit<StreamParams, 'id'>;

export type DraftStream = {
  clientId?: string;
  name?: string;
  origin?: 'local' | 'remote';
  source?: 'media' | 'screen';
  mediaStream?: MediaStream;
};

export as namespace RoomStreamType;
