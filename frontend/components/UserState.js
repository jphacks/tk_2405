"use client";

import { Card, CardBody, Heading, Text } from "@chakra-ui/react";

export default function UserStatus({ name, exercise }) {
  return (
    <Card
      w="100%"
      margin="10px"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
    >
      <CardBody>
        <Heading size="md" mb="2">
          {name}
        </Heading>
        <Text fontSize="lg" color="gray.600">
          現在の運動:{" "}
          <Text as="span" fontWeight="bold" color="teal.500">
            {exercise}
          </Text>
        </Text>
      </CardBody>
    </Card>
  );
}
