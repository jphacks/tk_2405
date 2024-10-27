import { NextResponse } from "next/server";

const endpoint =
  "https://gxaf9cnsbb.execute-api.ap-northeast-1.amazonaws.com/main/test";

export async function POST(request) {
  const query = { key: "うんこ" };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
