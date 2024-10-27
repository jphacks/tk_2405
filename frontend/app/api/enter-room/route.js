const endpoint =
  "https://gxaf9cnsbb.execute-api.ap-northeast-1.amazonaws.com/release/rooms/enter";

export async function POST(request) {
  const { userId, strength, duration } = await request.json();
  console.log(
    `userId: ${userId}, strength: ${strength}, duration: ${duration}`
  );

  const res = await fetch(endpoint + "?user_id=" + userId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ strength, duration }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      "content-type": "application/json",
    },
  });
}
