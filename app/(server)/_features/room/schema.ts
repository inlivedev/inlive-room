import {  text, integer, pgTable } from "drizzle-orm/pg-core";
 
export const rooms = pgTable("rooms", {
  id: text("id"),                 //this refer to inlive room room-id, room.inlive.app/<id>
  name:text("name"),
  roomID: text("room_id"),        //this describe the inlive-hub roomID
  createdBy: integer("user_id"),
});