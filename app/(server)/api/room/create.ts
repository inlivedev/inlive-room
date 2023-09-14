import { NextApiRequest, NextApiResponse } from "next";
import { apiResponse } from "../_shared/types";
import { roomRoutesHandler } from ".";


export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method != "POST") {
    res.status(405);
    return;
  }

  const requestToken = req.cookies["token"];

  if (!requestToken) {
    res.status(401).json(
      {
        code: 401,
        message: "Please check if token is provided in the cookie",
      } as apiResponse,
    );
    return;
  }

  try{
    roomRoutesHandler.createRoomHandler(requestToken)
  }
  catch(e){
    res.status(500).json(
      {code: 500,message:"An error has occured on our side, please try again later"}as apiResponse
    )
  }
};
