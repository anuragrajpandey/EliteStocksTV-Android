import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Maximize, Volume2, VolumeX } from "lucide-react";
import { createTauriVideoClient } from "@get-air/video-tauri";
import type { PlayerItem } from "../types";

const client = createTauriVideoClient({
  playback: { android: { decoderFallback: true } },
});

type Props = {
  item: PlayerItem;
  onClose: () => void;
};

export default function Player({ item, onClose }: Props) {
  const anchor = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let alive = true;

    async function start() {
      if (!anchor.current) return;
      try {
        const player = await client.attach(anchor.current, {
          source: item.url,
          backend: "tauri",
          backendOptions: {
            tauri: { engine: "auto" },
          },
        });
        playerRef.current = player;
        if (alive) await player.play();
      } catch (err) {
        console.error(err);
        if (alive) setError("This stream could not be played. Try another channel.");
      }
    }

    start();

    return () => {
      alive = false;
      const player = playerRef.current;
      try {
        player?.pause?.();
        player?.destroy?.();
        player?.dispose?.();
      } catch {}
      playerRef.current = null;
    };
  }, [item.url]);

  function toggleFullscreen() {
    document.documentElement.requestFullscreen?.();
  }

  return (
    <div className="player-screen">
      <div className="player-topbar">
        <button className="round-button" onClick={onClose} aria-label="Back">
          <ArrowLeft size={21} />
        </button>
        <div className="player-title">{item.title}</div>
        <button className="round-button" onClick={toggleFullscreen} aria-label="Fullscreen">
          <Maximize size={19} />
        </button>
      </div>

      <div className="player-stage">
        <video
          ref={anchor}
          className="native-video-anchor"
          playsInline
          muted={muted}
          controls
          poster={item.image}
        />
        {error && <div className="player-error">{error}</div>}
      </div>

      <div className="player-footer">
        <div>
          <div className="player-now">{item.title}</div>
          <div className="player-kind">{item.kind === "live" ? "LIVE TV" : "MOVIE"}</div>
        </div>
        <button className="round-button" onClick={() => setMuted((v) => !v)}>
          {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
      </div>
    </div>
  );
}