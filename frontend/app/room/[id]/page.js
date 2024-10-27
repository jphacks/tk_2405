"use client";

import { useState, useEffect } from "react";
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

  return (
    <Box>
      {data ? (
        <Stack>
          <Box>
            <Text>トレーニング中…</Text>
            <Text>強度: {getStrengthText(data?.training_strength)}</Text>
            <Text>残り時間：{Math.floor(data?.remain_lifetime / 60)}分</Text>
          </Box>
        </Stack>
      ) : (
        <Text>Loading...</Text>
      )}
    </Box>
  );
}
