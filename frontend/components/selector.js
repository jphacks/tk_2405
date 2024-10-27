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
  Center,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Selector({ isOpen, onClose }) {
  const [isWaiting, setIsWaiting] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      strength: "2",
      duration: 30,
    },
  });

  const strength = watch("strength");
  const duration = watch("duration");

  const router = useRouter();

  const onSubmit = async (data) => {
    const userId = localStorage.getItem("user_id");
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
      console.log(res.status);
      console.log(result);
      router.push(`/room/${result.room_id}`);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // useEffect(() => {
  //   if (isWaiting) {
  //     router.push(`/room/${result.room_id}`);
  //   }
  // }, [isWaiting]);

  const getStrengthText = (strength) => {
    switch (strength) {
      case "1":
        return "軽め";
      case "2":
        return "普通";
      case "3":
        return "きつめ";
      default:
        return "普通";
    }
  };

  <Stack alignItems="center">
    <ModalHeader>部屋を探しています</ModalHeader>
    <ModalBody></ModalBody>
  </Stack>;

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {isWaiting ? (
          <>
            <ModalHeader>
              <Center>
                <Stack alignItems="center" spacing={7}>
                  <Text fontSize="2xl">部屋を探しています</Text>
                  <Spinner size="xl" speed="1s" thickness="4px" />
                  <Box>
                    <Text
                      textAlign="center"
                      fontWeight="normal"
                      fontSize="md"
                      mb={1}
                    >
                      あなたに最適な部屋を見つけています…
                    </Text>
                    <Text textAlign="center" fontWeight="normal" fontSize="sm">
                      しばらくお待ちください
                    </Text>
                  </Box>
                </Stack>
              </Center>
            </ModalHeader>
            <ModalBody>
              <Box bgColor="gray.100" p={5} borderRadius="md">
                <Text fontWeight="bold" fontSize="lg" mb={2}>
                  選択した内容
                </Text>
                <Text>強度：{getStrengthText(strength)}</Text>
                <Text>時間：{duration} 分</Text>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                onClick={() => setIsWaiting(false)}
                borderRadius="md"
                w="100%"
              >
                キャンセル
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <form method="POST" onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                <Center>
                  <Stack alignItems="center">
                    <Text fontSize="2xl" fontWeight="bold">
                      トレーニング内容の設定
                    </Text>
                    <Text fontSize="md" color="gray.600">
                      あなたに合った筋トレの強度と時間を設定しましょう
                    </Text>
                  </Stack>
                </Center>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel fontWeight="bold" fontSize="lg">
                      強度
                    </FormLabel>
                    <RadioGroup
                      value={strength}
                      onChange={(value) => setValue("strength", value)}
                      colorScheme="teal"
                    >
                      <Stack>
                        <Radio value="1">軽め</Radio>
                        <Radio value="2">普通</Radio>
                        <Radio value="3">きつめ</Radio>
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
                      colorScheme="teal"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text color="gray.500">{duration}分</Text>
                  </FormControl>

                  <Box bgColor="gray.100" p={5} borderRadius="md">
                    <Text fontWeight="bold" fontSize="lg" mb={2}>
                      選択した内容
                    </Text>
                    <Text>強度：{getStrengthText(strength)}</Text>
                    <Text>時間：{duration} 分</Text>
                  </Box>
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="submit"
                  colorScheme="teal"
                  color="white"
                  borderRadius="md"
                  w="100%"
                >
                  この設定で部屋を探す
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
