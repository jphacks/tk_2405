import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const roomId = searchParams.get("roomId");

  if (!userId || !roomId) {
    return NextResponse.json(
      { error: "Missing userId or roomId" },
      { status: 400 }
    );
  }

  const endpoint = `https://gxaf9cnsbb.execute-api.ap-northeast-1.amazonaws.com/release/rooms/${roomId}?user_id=${userId}`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", res.status); // ステータスコードを確認
    console.log("Response headers:", res.headers); // ヘッダーを確認

    if (!res.ok) {
      throw new Error(`Fetch error: ${res.status}`);
    }

    const data = await res.json();
    console.log("Response data:", data); // 取得したデータを確認

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
