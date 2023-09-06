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
  origin: 'local' | 'remote';
  source: 'media' | 'screen';
  mediaStream: MediaStream;
};

export type AddStreamParams = Omit<StreamParams, 'id'>;

export type DraftStream = {
  origin?: StreamParams['origin'];
  source?: StreamParams['source'];
  mediaStream?: StreamParams['stream'];
};

export as namespace RoomStreamType;
