'use client';

import { useState } from 'react'
import { Box, Button, Card, CardBody, CardFooter, CardHeader,
Divider, FormControl, FormLabel, Heading, Input, Tabs, Tab, TabList, TabPanel, TabPanels,
Text, Alert, AlertIcon } from '@chakra-ui/react'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('') 

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!id || !password || (!isLogin && !userName)) {
      setError('ID、パスワード、ニックネーム（新規登録時）を入力してください。')
      return
    }

    // APIリクエストの送信
    try {
        const response = await fetch(isLogin 
            ? 'ログイン画面ならログイン用のAPI?' 
            : '新規登録なら新規登録用のAPI?', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                user_id: userId,
                password: password,
                user_name: userName,
                id,
              })
          })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'エラーが発生しました。')
      }

      console.log(isLogin ? 'ログイン成功' : '新規登録成功', data)
      setUserId(data.user_id)
      // ログインや登録が成功した際の処理（例: 次のページへ遷移）

    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card maxW="sm" mx="auto" boxShadow="lg">
      <CardHeader>
        <Heading size="md" textAlign="center">
          {isLogin ? 'ログイン' : '新規登録'}
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
                <FormControl id="id" isRequired>
                  <FormLabel>ID</FormLabel>
                  <Input
                    type="text"  
                    value={id}
                    onChange={(e) => setId(e.target.value)}
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
                <FormControl id="id" isRequired>
                  <FormLabel>ID</FormLabel>
                  <Input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
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
            ? 'アカウントをお持ちでない場合は、新規登録タブをクリックしてください。'
            : 'すでにアカウントをお持ちの場合は、ログインタブをクリックしてください。'}
        </Text>
      </CardFooter>
    </Card>
  )
}
