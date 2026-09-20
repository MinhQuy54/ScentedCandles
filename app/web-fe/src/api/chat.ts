import { env } from "../config/env";

export async function streamChat(
  message: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${env.apiBaseUrl}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error("CHAT_FAILED");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const text = decoder.decode(value, { stream: true });
    if (text) {
      onChunk(text);
    }
  }
}
