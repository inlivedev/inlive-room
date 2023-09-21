import { NextApiRequest, NextApiResponse } from 'next';
import { roomRoutesHandler } from '.';
import { apiResponse } from '../_shared/types';
import { isError } from 'lodash-es';

const joinHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method != 'GET') {
    res.status(405);
    return;
  }
  try {
    let roomID = req.query['roomID'];
    if (roomID == undefined) {
      throw new Error('Room ID was not provided');
    }

    if (Array.isArray(roomID)) {
      roomID = roomID.join();
    }

    const existingRoom = await roomRoutesHandler.joinRoomHandler(roomID);
    const response: apiResponse = {
      code: 200,
      message: 'Room found',
      data: existingRoom,
    };

    res.status(200).json(response);
  } catch (error) {
    if (!isError(error)) {
      const response: apiResponse = {
        code: 500,
        message: 'an error has occured on our side please try again later',
      };

      res.status(500).json(response);
      return;
    }

    const response: apiResponse = {
      code: 500,
      message: error.message,
    };

    res.status(500).json(response);
  }
};

export default joinHandler;
