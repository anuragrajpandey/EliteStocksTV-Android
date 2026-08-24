import { useEffect, useMemo, useState } from "react";
import { Home, Radio, Film, Heart, Search, LogOut, RefreshCw, ChevronRight } from "lucide-react";
import Login from "./components/Login";
import ChannelCard from "./components/ChannelCard";
import Player from "./components/Player";
import {
  getLiveCategories,
  getLiveChannels,
  getShortEpg,
  getVod,
  getVodCategories,
  login,
  streamUrl,
} from "./api";
import { clearCredentials, loadCredentials, loadFavorites, saveCredentials, saveFavorites } from "./storage";
import type { Account, Category, Credentials, EpgItem, LiveChannel, PlayerItem, Section, VodItem } from "./types";

function asPlayerItem(credentials: Credentials, channel: LiveChannel): PlayerItem {
  return {
    id: `live:${channel.stream_id}`,
    title: channel.name,
    kind: "live",
    image: channel.stream_icon,
    url: streamUrl(credentials, "live", channel.stream_id, "ts"),
  };
}

function asMovieItem(credentials: Credentials, movie: VodItem): PlayerItem {
  return {
    id: `movie:${movie.stream_id}`,
    title: movie.name,
    kind: "movie",
    image: movie.stream_icon,
    url: streamUrl(credentials, "movie", movie.stream_id, movie.container_extension || "mp4"),
  };
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials());
  const [account, setAccount] = useState<Account | null>(null);
  const [section, setSection] = useState<Section>("home");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [liveCategories, setLiveCategories] = useState<Category[]>([]);
  const [movieCategories, setMovieCategories] = useState<Category[]>([]);
  const [live, setLive] = useState<LiveChannel[]>([]);
  const [movies, setMovies] = useState<VodItem[]>([]);
  const [selectedLiveCategory, setSelectedLiveCategory] = useState("");
  const [selectedMovieCategory, setSelectedMovieCategory] = useState("");
  const [favorites, setFavorites] = useState<PlayerItem[]>(loadFavorites());
  const [query, setQuery] = useState("");
  const [playerItem, setPlayerItem] = useState<PlayerItem | null>(null);
  const [epg, setEpg] = useState<EpgItem[]>([]);

  async function loadLibrary(creds: Credentials) {
    setBusy(true);
    setError("");
    try {
      const [accountData, liveCats, movieCats, liveItems, movieItems] = await Promise.all([
        login(creds),
        getLiveCategories(creds),
        getVodCategories(creds),
        getLiveChannels(creds),
        getVod(creds),
      ]);
      if (Number(accountData.user_info?.auth ?? 0) !== 1) {
        throw new Error(accountData.user_info?.message || "Invalid Xtream Codes credentials.");
      }
      setAccount(accountData);
      setLiveCategories(liveCats || []);
      setMovieCategories(movieCats || []);
      setLive(liveItems || []);
      setMovies(movieItems || []);
      saveCredentials(creds);
      setCredentials(creds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the IPTV server.");
      throw err;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (credentials) loadLibrary(credentials).catch(() => {});
  }, []);

  function handleLogin(creds: Credentials) {
    loadLibrary(creds).catch(() => {});
  }

  function logout() {
    clearCredentials();
    setCredentials(null);
    setAccount(null);
    setLive([]);
    setMovies([]);
    setFavorites([]);
    setSection("home");
  }

  function toggleFavorite(item: PlayerItem) {
    const next = favorites.some((value) => value.id === item.id)
      ? favorites.filter((value) => value.id !== item.id)
      : [item, ...favorites];
    setFavorites(next);
    saveFavorites(next);
  }

  async function play(item: PlayerItem) {
    setPlayerItem(item);
    if (item.kind === "live" && credentials) {
      try {
        const result = await getShortEpg(credentials, Number(item.id.split(":")[1]));
        setEpg(result.epg_listings || []);
      } catch {
        setEpg([]);
      }
    } else {
      setEpg([]);
    }
  }

  const filteredLive = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live.filter((item) => !q || item.name.toLowerCase().includes(q));
  }, [live, query]);

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter((item) => !q || item.name.toLowerCase().includes(q));
  }, [movies, query]);

  const favoriteMatches = useMemo(
    () => favorites.filter((item) => !query || item.title.toLowerCase().includes(query.toLowerCase())),
    [favorites, query],
  );

  if (!credentials) {
    return <Login initial={loadCredentials()} busy={busy} error={error} onSubmit={handleLogin} />;
  }

  if (playerItem) {
    return <Player item={playerItem} onClose={() => setPlayerItem(null)} />;
  }

  const hero = live[0] ? asPlayerItem(credentials, live[0]) : null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => setSection("home")}>
          <span className="brand-mini">E</span>
          <span>EliteStocks TV</span>
        </button>

        <div className="top-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setSection("search");
              }}
              placeholder="Search"
            />
          </div>
          <button className="round-button" onClick={() => credentials && loadLibrary(credentials)} aria-label="Refresh">
            <RefreshCw size={18} className={busy ? "spin" : ""} />
          </button>
          <button className="round-button" onClick={logout} aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {section === "home" && hero && (
        <section className="hero">
          <div className="hero-backdrop" style={hero.image ? { backgroundImage: `url("${hero.image}")` } : undefined} />
          <div className="hero-gradient" />
          <div className="hero-content">
            <div className="eyebrow">LIVE NOW</div>
            <h1>{hero.title}</h1>
            <p>Jump straight into your live channel lineup.</p>
            <div className="hero-actions">
              <button className="primary-button compact" onClick={() => play(hero)}>Play now</button>
              <button className="secondary-button" onClick={() => toggleFavorite(hero)}>
                {favorites.some((x) => x.id === hero.id) ? "Saved" : "Add to My List"}
              </button>
            </div>
          </div>
        </section>
      )}

      <main className="content">
        {section === "home" && (
          <>
            <SectionRow
              title="Live TV"
              action="See all"
              onAction={() => setSection("live")}
              items={live.slice(0, 12).map((item) => asPlayerItem(credentials, item))}
              favorites={favorites}
              onPlay={play}
              onFavorite={toggleFavorite}
            />
            <SectionRow
              title="Movies"
              action="See all"
              onAction={() => setSection("movies")}
              items={movies.slice(0, 12).map((item) => asMovieItem(credentials, item))}
              favorites={favorites}
              onPlay={play}
              onFavorite={toggleFavorite}
            />
            {epg.length > 0 && <EpgStrip items={epg} />}
          </>
        )}

        {section === "live" && (
          <LibrarySection
            title="Live TV"
            categories={liveCategories}
            selected={selectedLiveCategory}
            onCategory={async (id) => {
              setSelectedLiveCategory(id);
              setBusy(true);
              try { setLive(await getLiveChannels(credentials, id || undefined)); } finally { setBusy(false); }
            }}
            items={filteredLive.map((item) => asPlayerItem(credentials, item))}
            favorites={favorites}
            onPlay={play}
            onFavorite={toggleFavorite}
          />
        )}

        {section === "movies" && (
          <LibrarySection
            title="Movies"
            categories={movieCategories}
            selected={selectedMovieCategory}
            onCategory={async (id) => {
              setSelectedMovieCategory(id);
              setBusy(true);
              try { setMovies(await getVod(credentials, id || undefined)); } finally { setBusy(false); }
            }}
            items={filteredMovies.map((item) => asMovieItem(credentials, item))}
            favorites={favorites}
            onPlay={play}
            onFavorite={toggleFavorite}
          />
        )}

        {section === "search" && (
          <LibrarySection
            title={query ? `Results for "${query}"` : "Search"}
            categories={[]}
            selected=""
            onCategory={() => {}}
            items={[
              ...filteredLive.map((item) => asPlayerItem(credentials, item)),
              ...filteredMovies.map((item) => asMovieItem(credentials, item)),
            ]}
            favorites={favorites}
            onPlay={play}
            onFavorite={toggleFavorite}
          />
        )}

        {section === "favorites" && (
          <LibrarySection
            title="My List"
            categories={[]}
            selected=""
            onCategory={() => {}}
            items={favoriteMatches}
            favorites={favorites}
            onPlay={play}
            onFavorite={toggleFavorite}
          />
        )}
      </main>

      <nav className="bottom-nav">
        <NavButton active={section === "home"} icon={<Home size={20} />} label="Home" onClick={() => setSection("home")} />
        <NavButton active={section === "live"} icon={<Radio size={20} />} label="Live TV" onClick={() => setSection("live")} />
        <NavButton active={section === "movies"} icon={<Film size={20} />} label="Movies" onClick={() => setSection("movies")} />
        <NavButton active={section === "favorites"} icon={<Heart size={20} />} label="My List" onClick={() => setSection("favorites")} />
      </nav>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SectionRow({ title, action, onAction, items, favorites, onPlay, onFavorite }: { title: string; action: string; onAction: () => void; items: PlayerItem[]; favorites: PlayerItem[]; onPlay: (item: PlayerItem) => void; onFavorite: (item: PlayerItem) => void }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>{title}</h2>
        <button onClick={onAction}>{action}<ChevronRight size={16} /></button>
      </div>
      <div className="media-grid">
        {items.map((item) => <ChannelCard key={item.id} item={item} favorite={favorites.some((f) => f.id === item.id)} onPlay={onPlay} onFavorite={onFavorite} />)}
      </div>
    </section>
  );
}

function LibrarySection({ title, categories, selected, onCategory, items, favorites, onPlay, onFavorite }: { title: string; categories: Category[]; selected: string; onCategory: (id: string) => void; items: PlayerItem[]; favorites: PlayerItem[]; onPlay: (item: PlayerItem) => void; onFavorite: (item: PlayerItem) => void }) {
  return (
    <section className="section-block library">
      <div className="page-title">
        <h1>{title}</h1>
      </div>
      {categories.length > 0 && (
        <div className="category-strip">
          <button className={!selected ? "selected" : ""} onClick={() => onCategory("")}>All</button>
          {categories.map((cat) => (
            <button key={cat.category_id} className={selected === cat.category_id ? "selected" : ""} onClick={() => onCategory(cat.category_id)}>
              {cat.category_name}
            </button>
          ))}
        </div>
      )}
      {items.length ? (
        <div className="media-grid large">
          {items.map((item) => <ChannelCard key={item.id} item={item} favorite={favorites.some((f) => f.id === item.id)} onPlay={onPlay} onFavorite={onFavorite} />)}
        </div>
      ) : (
        <div className="empty-state">Nothing here yet.</div>
      )}
    </section>
  );
}

function EpgStrip({ items }: { items: EpgItem[] }) {
  return (
    <section className="epg-strip">
      <div className="section-heading"><h2>Up next</h2></div>
      <div className="epg-list">
        {items.map((item, index) => (
          <div className="epg-item" key={`${item.id ?? "epg"}-${index}`}>
            <div className="epg-time">{item.start ?? "—"}</div>
            <div className="epg-title">{item.title ?? "Program"}</div>
            <div className="epg-description">{item.description ?? ""}</div>
          </div>
        ))}
      </div>
    </section>
  );
}