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
import Selector from "../components/selector";

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box height="100vh">
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        gap={3}
      >
        <Heading fontSize="6xl">あなたの筋トレをサポート</Heading>
        <Text textAlign="center" fontSize="xl">
          シェアトレ！で筋トレを始めましょう．あなたに合ったトレーニングルームが見つかります．
        </Text>
        <Button onClick={onOpen} mt={3} size="lg">
          筋トレを始める
        </Button>
        <Selector isOpen={isOpen} onClose={onClose} />
      </Flex>
    </Box>
  );
}
