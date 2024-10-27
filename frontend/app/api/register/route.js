const endpoint =
  "https://gxaf9cnsbb.execute-api.ap-northeast-1.amazonaws.com/release/users/register";

export async function POST(request) {
  const { user_id, user_name, password } = await request.json();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id, user_name, password }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      "content-type": "application/json",
    },
  });
}
