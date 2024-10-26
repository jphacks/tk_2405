'use client'

import { useState, useEffect } from 'react';
import { Box, Avatar, Text, Heading, SimpleGrid, Container, Card, CardHeader, CardBody } from '@chakra-ui/react';

// 仮のデータ取得関数（実際にはTensorFlow.jsからデータを取得する）
const fetchUserStatus = async (user_id) => {
  // この関数は実際にはTensorFlow.jsを使用してデータを取得します
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user_id,
        name: `User ${user_id}`,
        exercise: ['腹筋', 'スクワット', '腕立て伏せ'][Math.floor(Math.random() * 3)],
      });
    }, 1000);
  });
};

export default function TrainingRoom() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userIds = ['1', '2', '3', '4'];
    const fetchData = async () => {
      const userData = await Promise.all(userIds.map((id) => fetchUserStatus(id)));
      setUsers(userData);
    };
    fetchData();
    // 実際のアプリケーションでは、ここでインターバルを設定して定期的にデータを更新します
  }, []);

  return (
    <Container maxW="container.md" py={4}>
      <Heading as="h1" size="lg" mb={6}>
        トレーニングルーム
      </Heading>
      <SimpleGrid columns={[1, 2]} spacing={4}>
        {users.map((user) => (
          <Card key={user.user_id}>
            <CardHeader display="flex" alignItems="center" gap={4}>
              <Avatar name={user.name} src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
              <Text fontSize="lg">{user.name}</Text>
            </CardHeader>
            <CardBody>
              <Text fontSize="md" fontWeight="bold" color="gray.700">
                現在の運動: <Text as="span" color="blue.500">{user.exercise}</Text>
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
