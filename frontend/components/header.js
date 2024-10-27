"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box as="header">
      <Flex
        align="center"
        justify="flex-start"
        wrap="wrap"
        padding="1.5rem"
        bg="teal.500"
        color="white"
      >
        <Heading>シェアトレ！</Heading>
      </Flex>
    </Box>
  );
}
