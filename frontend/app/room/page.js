import { Box } from "@chakra-ui/react";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const initialUsers = [
  { id: 1, user_name: "", status: "休憩中" },
  { id: 2, user_name: "", status: "休憩中" },
  { id: 3, user_name: "", status: "休憩中" },
  { id: 4, user_name: "", status: "休憩中" },
];

export default function Room() {
  return <Box></Box>;
}
