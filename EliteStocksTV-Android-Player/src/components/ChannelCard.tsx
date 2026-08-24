import { Heart, Play } from "lucide-react";
import type { PlayerItem } from "../types";

type Props = {
  item: PlayerItem;
  favorite: boolean;
  onPlay: (item: PlayerItem) => void;
  onFavorite: (item: PlayerItem) => void;
};

export default function ChannelCard({ item, favorite, onPlay, onFavorite }: Props) {
  return (
    <article className="media-card">
      <button className="poster" onClick={() => onPlay(item)} aria-label={`Play ${item.title}`}>
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
        ) : (
          <div className="poster-fallback">{item.title.slice(0, 1).toUpperCase()}</div>
        )}
        <div className="poster-overlay">
          <span className="play-circle"><Play fill="currentColor" size={18} /></span>
        </div>
      </button>
      <div className="media-meta">
        <div className="media-title" title={item.title}>{item.title}</div>
        <button className={`favorite-button ${favorite ? "active" : ""}`} onClick={() => onFavorite(item)}>
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}