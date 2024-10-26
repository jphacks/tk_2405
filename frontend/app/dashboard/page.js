"use client";

import {
  Box,
  Heading,
  Text,
  Button,
  Container,
  Center,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import Selector from "../../components/selector";
import { useRouter } from "next/navigation";

export default function DashBoard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userName = localStorage.getItem("user_name");
  const userId = localStorage.getItem("user_id");
  const router = useRouter();

  if (!userId) {
    router.push("/");
  }

  return (
    <Box height="100vh">
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        gap={3}
      >
        <Heading fontSize="6xl">ようこそ{userName}さん！</Heading>
        <Text textAlign="center" fontSize="xl">
          シェアトレ！で筋トレを始めましょう．あなたに合ったトレーニングルームが見つかります．
        </Text>
        <Button
          onClick={onOpen}
          mt={3}
          size="lg"
          color="white"
          colorScheme="teal"
        >
          筋トレを始める
        </Button>
        <Selector isOpen={isOpen} onClose={onClose} />
      </Flex>
    </Box>
  );
}
