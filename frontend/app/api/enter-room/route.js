const endpoint =
  "https://gxaf9cnsbb.execute-api.ap-northeast-1.amazonaws.com/main/rooms/enter";

export async function POST(request) {
  const { userId, strength, duration } = await request.json();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, strength, duration }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      "content-type": "application/json",
    },
  });
}