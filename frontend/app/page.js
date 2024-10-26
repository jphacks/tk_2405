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
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const userId = localStorage.getItem("user_id");

  if (userId) {
    router.push("/dashboard");
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
        <Heading fontSize="5xl">あなたの筋トレをサポート</Heading>
        <Text textAlign="center" fontSize="xl">
          シェアトレ！で筋トレを始めましょう<br />
          あなたに合ったトレーニングルームが見つかります
        </Text>
        <Button
          as={NextLink}
          href="/login"
          mt={3}
          size="lg"
          color="white"
          colorScheme="teal"
        >
          今すぐ始める（無料）
        </Button>
      </Flex>
    </Box>
  );
}
