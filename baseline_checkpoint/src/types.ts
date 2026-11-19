export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00
  end: number;   // minutes from 00:00
  title: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export type Decision =
  | { status: "available"; roomName: string }
  | { status: "unavailable"; reason: string };

export type IntervalInput = {
  start: string;
  end: string;
};
