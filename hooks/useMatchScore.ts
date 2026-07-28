import { useState, useEffect, useRef } from "react";
import EventSource from "react-native-sse";

interface TeamScore {
  id: string;
  name: string;
}

interface MatchScoreData {
  matchId: string;
  sessionId?: string;
  teamOne: TeamScore;
  teamTwo: TeamScore;
  teamOneScore: number;
  teamTwoScore: number;
  timestamp: number;
  connected: boolean;
  error?: string;
}

interface UseMatchScoreOptions {
  matchId?: string;
  sessionId?: string;
  globalStream?: boolean;
  onScoreUpdate?: (data: MatchScoreData) => void;
  onError?: (error: string) => void;
}

const useMatchScore = (options: UseMatchScoreOptions) => {
  const {
    matchId,
    sessionId,
    globalStream = false,
    onScoreUpdate,
    onError,
  } = options;

  // Stable refs for callbacks — changing these never re-triggers the SSE effect
  const onScoreUpdateRef = useRef(onScoreUpdate);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
    onErrorRef.current = onError;
  });

  const [scoreData, setScoreData] = useState<MatchScoreData>({
    matchId: matchId || "",
    teamOne: { id: "", name: "Team One" },
    teamTwo: { id: "", name: "Team Two" },
    teamOneScore: 0,
    teamTwoScore: 0,
    timestamp: Date.now(),
    connected: false,
  });

  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());

  useEffect(() => {
    if (!matchId && !sessionId && !globalStream) {
      return;
    }

    let streamUrl = "";
    const baseUrl = "https://i-one-server-v1.onrender.com";

    if (globalStream) {
      streamUrl = `${baseUrl}/i-one/matches/stream`;
    } else if (sessionId) {
      streamUrl = `${baseUrl}/i-one/matches/stream/session/${sessionId}`;
    } else if (matchId) {
      streamUrl = `${baseUrl}/i-one/matches/stream/${matchId}`;
    }

    console.log("🔌 Connecting to SSE:", streamUrl);

    const eventSource = new EventSource(streamUrl, {
      withCredentials: true,
      headers: {
        "Content-Type": "text/event-stream",
      },
    });

    eventSource.addEventListener("open", () => {
      console.log("SSE connection established");
      setScoreData((prev) => ({ ...prev, connected: true, error: undefined }));
      setLastHeartbeat(Date.now());
    });

    eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data || "{}");

        switch (data.type) {
          case "connected":
            setLastHeartbeat(Date.now());
            break;

          case "heartbeat":
            setLastHeartbeat(Date.now());
            break;

          case "score-update": {
            const updatedData: MatchScoreData = {
              matchId: data.matchId,
              sessionId: data.sessionId,
              teamOne: data.teamOne,
              teamTwo: data.teamTwo,
              teamOneScore: data.teamOneScore,
              teamTwoScore: data.teamTwoScore,
              timestamp: data.timestamp || Date.now(),
              connected: true,
            };
            setScoreData(updatedData);
            setLastHeartbeat(Date.now());
            onScoreUpdateRef.current?.(updatedData);
            break;
          }

          case "error":
            setScoreData((prev) => ({
              ...prev,
              error: data.message,
              connected: false,
            }));
            onErrorRef.current?.(data.message);
            break;
        }
      } catch {
        // ignore parse errors
      }
    });

    eventSource.addEventListener("error", (error) => {
      const errorData = (error as any)?.data ?? "";
      const isFatal =
        typeof errorData === "string" &&
        (errorData.includes("maximum connections") ||
          errorData.includes("Maximum connections"));

      if (isFatal) {
        // Server explicitly rejected — stop immediately, don't retry
        eventSource.close();
        setScoreData((prev) => ({
          ...prev,
          connected: false,
          error: "Too many connections",
        }));
        // Don't surface this as a user-facing error; it will self-resolve
      } else {
        setScoreData((prev) => ({
          ...prev,
          connected: false,
          error: "Connection lost",
        }));
        onErrorRef.current?.("Connection error occurred");
      }
    });

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
    // Callbacks intentionally excluded — they live in refs above
     
  }, [matchId, sessionId, globalStream]);

  // Monitor heartbeat health
  useEffect(() => {
    const heartbeatCheck = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeat;

      // If no heartbeat for 60 seconds, mark as disconnected
      if (timeSinceLastHeartbeat > 60000 && scoreData.connected) {
        console.warn(
          "⚠️ No heartbeat received in 60s - connection may be stale",
        );
        setScoreData((prev) => ({
          ...prev,
          connected: false,
          error: "Connection timeout",
        }));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(heartbeatCheck);
  }, [lastHeartbeat, scoreData.connected]);

  return scoreData;
};

export default useMatchScore;
