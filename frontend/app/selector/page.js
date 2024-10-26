"use client";

import {
  Box,
  Text,
  FormControl,
  FormLabel,
  RadioGroup,
  Stack,
  Radio,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  Card,
  CardHeader,
  CardBody,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isWaiting, setIsWaiting] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      strength: "1",
      duration: 30,
    },
  });

  const strength = watch("strength");
  const duration = watch("duration");

  const router = useRouter();

  const onSubmit = async (data) => {
    const userId = localStorage.getItem("userId");
    const reqData = { ...data, userId: userId };
    try {
      const res = await fetch("/api/enter-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setIsWaiting(true);
      const result = await res.json();
      console.log(result);
      router.push(`/room/${result.roomId}`);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case "0":
        return "軽め";
      case "1":
        return "普通";
      case "2":
        return "きつめ";
      default:
        return "普通";
    }
  };

  if (isWaiting) {
    return (
      <Center h="100vh">
        <Spinner size="xl" mr={5} />
        <Text mt={4}>部屋を探しています...</Text>
      </Center>
    );
  }

  return (
    <Box>
      <Card maxW="md" w="100%" mx="auto" borderRadius="lg">
        <form method="POST" onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <Text fontSize="2xl" fontWeight="bold">
              筋トレ設定
            </Text>
            <Text fontSize="md" color="gray.600">
              あなたに合った筋トレの強度と時間を設定してください．
            </Text>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="bold" fontSize="lg">
                  強度
                </FormLabel>
                <RadioGroup
                  value={strength}
                  onChange={(value) => setValue("strength", value)}
                >
                  <Stack>
                    <Radio value="0">軽め</Radio>
                    <Radio value="1">普通</Radio>
                    <Radio value="2">きつめ</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="lg">
                  時間（分）
                </FormLabel>
                <Slider
                  defaultValue={30}
                  min={10}
                  max={120}
                  step={10}
                  {...register("duration")}
                  onChange={(val) => setValue("duration", val)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text color="gray.500">{duration}分</Text>
              </FormControl>

              <Box bgColor="gray.100" p={4} borderRadius="md">
                <Text fontWeight="bold" fontSize="lg" mb={2}>
                  選択内容
                </Text>
                <Text>強度：{getStrengthText(strength)}</Text>
                <Text>時間：{duration} 分</Text>
              </Box>
            </Stack>

            <Center>
              <Button
                type="submit"
                mt={4}
                bgColor="gray.900"
                color="white"
                w="100%"
                borderRadius="md"
              >
                この設定で部屋を探す
              </Button>
            </Center>
          </CardBody>
        </form>
      </Card>
    </Box>
  );
}
