import { useAuctionStore } from "../store/auctionStore";
import { formatCurrency, CATEGORY_COLORS } from "../utils";
import styles from "./Audience.module.css";

export default function Audience() {
  const { teams, currentPlayer, currentBid, currentBidder, phase, bidHistory, players, setRole } = useAuctionStore();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <span className={styles.badge}>👀 Audience</span>
        <button className={styles.exitBtn} onClick={() => setRole(null)}>Exit</button>
      </header>

      <div className={styles.teamsRow}>
        {teams.map((t) => (
          <div key={t.id} className={styles.teamCard}>
            <div className={styles.teamName}>{t.name}</div>
            <div className={styles.teamCaptain}>{t.captain_name}</div>
            <div className={styles.teamPurse}>{formatCurrency(t.purse_remaining)}</div>
            <div className={styles.teamCount}>{t.players.length} players</div>
          </div>
        ))}
      </div>

      <main className={styles.main}>
        {phase !== "LIVE" || !currentPlayer ? (
          <div className={styles.waiting}>
            <div className={styles.waitingIcon}>🏏</div>
            <p>Waiting for the next player...</p>
          </div>
        ) : (
          <div className={styles.liveBox}>
            <div className={styles.liveBadge}>🔴 LIVE AUCTION</div>
            <div className={styles.playerName}>{currentPlayer.name}</div>
            <div className={styles.categoryBadge} style={{ background: CATEGORY_COLORS[currentPlayer.category]?.bg, color: CATEGORY_COLORS[currentPlayer.category]?.text }}>
              {currentPlayer.category}
            </div>
            <div className={styles.bidAmount}>{formatCurrency(currentBid)}</div>
            {currentBidder ? (
              <div className={styles.bidder}>Leading: <strong>{currentBidder.teamName}</strong></div>
            ) : (
              <div className={styles.bidder}>Base price — no bids yet</div>
            )}
          </div>
        )}
      </main>

      {bidHistory.length > 0 && (
        <div className={styles.bidHistory}>
          <h3>Live Bids</h3>
          {bidHistory.slice(0, 6).map((b, i) => (
            <div key={i} className={styles.bidRow}>
              <span>{b.teamName}</span>
              <span>{formatCurrency(b.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.poolSummary}>
        <h3>Auction Progress</h3>
        <div className={styles.miniGrid}>
          {players.map((p) => (
            <div key={p.id} className={`${styles.miniCard} ${styles[p.status.toLowerCase()]}`}>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
