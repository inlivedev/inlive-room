import { NextApiRequest, NextApiResponse } from 'next';
import { apiResponse } from '../../../_shared/types';
import { roomRoutesHandler } from '../../../_features/room/routes';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const requestToken = req.cookies['token'];

  if (!requestToken) {
    res.status(401).json({
      code: 401,
      message: 'Please check if token is provided in the cookie',
    } as apiResponse);
    return;
  }

  try {
    const createdRoom = await roomRoutesHandler.createRoomHandler(requestToken);

    res.status(201).json({
      code: 201,
      message: 'Room Created',
      data: createdRoom,
    } as apiResponse);
  } catch (e) {
    res.status(500).json({
      code: 500,
      message: 'An error has occured on our side, please try again later',
    } as apiResponse);
  }
}
