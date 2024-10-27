"use client";
import WebcamStreamComponent from "@/lib/pose-estimation";
import {
  Box,
  Avatar,
  Text,
  Heading,
  SimpleGrid,
  Container,
  Card,
  CardHeader,
  CardBody,
  Stack,
} from "@chakra-ui/react";
import { useRoom } from "../../../lib/use-room";
import UserState from "../../../components/UserState";

export default function TrainingRoom({ params }) {
  let userId = null;

  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    userId = localStorage.getItem("user_id");
  }
  const id = params.id;
  const { data, error } = useRoom(id, userId);
  console.log(data?.training_strength);

  const getStrengthText = (strength) => {
    switch (strength) {
      case 1:
        return "軽め";
      case 2:
        return "普通";
      case 3:
        return "きつめ";
      default:
        return "普通";
    }
  };

  const getCurrentStatus = (status) => {
    switch (status) {
      case 0:
        return "休憩中";
      default:
        return "トレーニング中";
    }
  };

  return (
    <Box>
      {data ? (
        <Box>
          <Stack>
            <Box>
              <Text>トレーニング中…</Text>
              <Text>強度: {getStrengthText(data?.training_strength)}</Text>
              <Text>残り時間：{Math.floor(data?.remain_lifetime / 60)}分</Text>
            </Box>
          </Stack>
          <SimpleGrid columns={2} spacing={10}>
            {data.participants.map((user) => (
              user.userId === userId ?
              <WebcamStreamComponent />:
              <UserState
                key={user.user_id}
                name={user.user_name}
                exercise={getCurrentStatus(user.current_status)}
              />
            ))}
          </SimpleGrid>
        </Box>
      ) : (
        <Text>Loading...</Text>
      )}
    </Box>
  );
}
