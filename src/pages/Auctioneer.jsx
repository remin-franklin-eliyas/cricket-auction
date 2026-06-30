import { useAuctionStore } from "../store/auctionStore";
import { formatCurrency, CATEGORY_COLORS } from "../utils";
import styles from "./Auctioneer.module.css";

export default function Auctioneer() {
  const { players, teams, currentPlayer, currentBid, currentBidder, phase, bidHistory, putUpForAuction, confirmSale, markUnsold, setRole } = useAuctionStore();

  const pending = players.filter((p) => p.status === "PENDING");
  const sold = players.filter((p) => p.status === "SOLD");
  const unsold = players.filter((p) => p.status === "UNSOLD");

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <span>🎙️ Auctioneer</span>
          <button className={styles.exitBtn} onClick={() => setRole(null)}>Exit</button>
        </div>

        {/* Team purses */}
        {teams.map((t) => (
          <div key={t.id} className={styles.teamCard}>
            <div className={styles.teamName}>{t.name}</div>
            <div className={styles.teamPurse}>{formatCurrency(t.purse_remaining)}</div>
            <div className={styles.teamMeta}>{t.players.length} players</div>
          </div>
        ))}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}><span>{pending.length}</span><label>Pending</label></div>
          <div className={styles.stat}><span>{sold.length}</span><label>Sold</label></div>
          <div className={styles.stat}><span>{unsold.length}</span><label>Unsold</label></div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Current auction */}
        <div className={styles.auctionBox}>
          {phase === "WAITING" && (
            <div className={styles.waiting}>
              <div className={styles.waitingIcon}>⏳</div>
              <p>Select a player below to start bidding</p>
            </div>
          )}

          {phase === "LIVE" && currentPlayer && (
            <div className={styles.liveBox}>
              <div className={styles.liveBadge}>🔴 LIVE</div>
              <div className={styles.playerName}>{currentPlayer.name}</div>
              <div className={styles.categoryBadge} style={{ background: CATEGORY_COLORS[currentPlayer.category]?.bg, color: CATEGORY_COLORS[currentPlayer.category]?.text }}>
                {currentPlayer.category}
              </div>
              <div className={styles.bidAmount}>{formatCurrency(currentBid)}</div>
              {currentBidder ? (
                <div className={styles.currentBidder}>Leading: <strong>{currentBidder.teamName}</strong></div>
              ) : (
                <div className={styles.currentBidder}>Base price — no bids yet</div>
              )}
              <div className={styles.actionBtns}>
                <button className={styles.soldBtn} onClick={confirmSale} disabled={!currentBidder}>✅ Sold</button>
                <button className={styles.unsoldBtn} onClick={markUnsold}>❌ Unsold</button>
              </div>
            </div>
          )}

          {(phase === "SOLD" || phase === "UNSOLD") && (
            <div className={styles.waiting}>
              <div className={styles.waitingIcon}>{phase === "SOLD" ? "🎉" : "😔"}</div>
              <p>{phase === "SOLD" ? "Player sold! Pick the next one." : "Marked unsold. Pick next player."}</p>
            </div>
          )}
        </div>

        {/* Bid history */}
        {bidHistory.length > 0 && (
          <div className={styles.bidHistory}>
            <h3>Bid History</h3>
            {bidHistory.slice(0, 5).map((b, i) => (
              <div key={i} className={styles.bidRow}>
                <span>{b.teamName}</span>
                <span>{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Player pool */}
        <div className={styles.pool}>
          <h3>Player Pool</h3>
          <div className={styles.playerGrid}>
            {players.map((p) => (
              <button
                key={p.id}
                className={`${styles.playerCard} ${p.status !== "PENDING" ? styles.playerDone : ""} ${currentPlayer?.id === p.id ? styles.playerActive : ""}`}
                onClick={() => p.status === "PENDING" && putUpForAuction(p.id)}
                disabled={p.status !== "PENDING"}
              >
                <span className={styles.playerCardName}>{p.name}</span>
                <span className={styles.playerCardCat} style={{ color: CATEGORY_COLORS[p.category]?.bg }}>{p.category}</span>
                <span className={styles.playerCardPrice}>{formatCurrency(p.base_price)}</span>
                {p.status === "SOLD" && <span className={styles.soldTag}>SOLD · {p.sold_to}</span>}
                {p.status === "UNSOLD" && <span className={styles.unsoldTag}>UNSOLD</span>}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
