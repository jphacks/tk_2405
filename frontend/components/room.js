import { Box, Text, Button, Input } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { roomsAtom } from "../lib/rooms-atom";

export function Room({ roomID, currentUserID }) {
  const [rooms, setRooms] = useAtom(roomsAtom);
  const room = rooms[roomID];

  return <Box></Box>;
}
