"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId || !password || (!isLogin && !userName)) {
      setError(
        "ID、パスワード、ニックネーム（新規登録時）を入力してください。"
      );
      return;
    }

    try {
      const response = await fetch(isLogin ? "/api/login" : "/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          password,
          user_name: isLogin ? undefined : userName,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log(isLogin ? "ログイン成功" : "サインアップ成功", data);
        localStorage.setItem("user_id", data.user_id); 
        localStorage.setItem("user_name", data.user_name);
        router.push("/dashboard");
      } else if (response.status === 403) {
        setError("パスワードが間違っています。");
      } else if (response.status === 404) {
        setError("ユーザーが存在しません。");
      } else if (response.status === 409) {
        setError("このIDはすでに登録されています。");
      } else {
        throw new Error(data.message || "エラーが発生しました。");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box textAlign="center" mt={8}>
      <Heading size="lg" mb={4}>
        さあ、筋トレを始めよう！
      </Heading>
      <Card maxW="sm" mx="auto" boxShadow="lg">
        <CardHeader>
          <Heading size="md" textAlign="center">
            {isLogin ? "ログイン" : "新規登録"}
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Tabs
            isFitted
            variant="soft-rounded"
            colorScheme="teal"
            onChange={(index) => setIsLogin(index === 0)}
          >
            <TabList>
              <Tab>ログイン</Tab>
              <Tab>新規登録</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <form onSubmit={handleSubmit}>
                  <FormControl id="userId" isRequired>
                    <FormLabel>ID</FormLabel>
                    <Input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </FormControl>
                  <FormControl id="password" isRequired mt={4}>
                    <FormLabel>パスワード</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>
                  {error && (
                    <Alert status="error" mt={4}>
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                  <Button colorScheme="teal" width="full" mt={6} type="submit">
                    ログイン
                  </Button>
                </form>
              </TabPanel>
              <TabPanel>
                <form onSubmit={handleSubmit}>
                  <FormControl id="userId" isRequired>
                    <FormLabel>ID</FormLabel>
                    <Input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </FormControl>
                  <FormControl id="password" isRequired mt={4}>
                    <FormLabel>パスワード</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>
                  <FormControl id="userName" isRequired mt={4}>
                    <FormLabel>ニックネーム</FormLabel>
                    <Input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </FormControl>
                  {error && (
                    <Alert status="error" mt={4}>
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                  <Button colorScheme="teal" width="full" mt={6} type="submit">
                    新規登録
                  </Button>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
        <CardFooter>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            {isLogin
              ? "アカウントをお持ちでない場合は、新規登録タブをクリックしてください。"
              : "すでにアカウントをお持ちの場合は、ログインタブをクリックしてください。"}
          </Text>
        </CardFooter>
      </Card>
    </Box>
  );
}
