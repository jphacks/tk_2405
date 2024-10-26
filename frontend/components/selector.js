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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Selector({ isOpen, onClose }) {
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
      //   router.push(`/room/${result.roomId}`);
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
                <Stack alignItems="center">
                  <Text fontSize="2xl" fontWeight="bold">
                    部屋を探しています
                  </Text>
                  <Spinner size="xl" mr={5} speed="1s" thickness="4px" />
                  <Text mt={4} textAlign="center">
                    あなたに最適な部屋を見つけています…
                  </Text>
                  <Text textAlign="center">しばらくお待ちください</Text>
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
                      筋トレ設定
                    </Text>
                    <Text fontSize="md" color="gray.600">
                      あなたに合った筋トレの強度と時間を設定してください．
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
                  bgColor="gray.900"
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
