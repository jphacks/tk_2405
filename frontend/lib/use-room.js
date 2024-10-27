import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

export function useRoom(roomId, userId) {
  const { data, error } = useSWR(
    `/api/get-room?roomId=${roomId}&userId=${userId}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );
  console.log(`data:${data}`);
  return {
    data,
    error,
  };
}
