import { useAuctionStore } from "../store/auctionStore";
import { formatCurrency, CATEGORY_COLORS } from "../utils";
import styles from "./Captain.module.css";

export default function Captain({ teamId }) {
  const { teams, players, currentPlayer, currentBid, currentBidder, phase, bidHistory, placeBid, setRole } = useAuctionStore();

  const myTeam = teams.find((t) => t.id === teamId);
  const otherTeam = teams.find((t) => t.id !== teamId);
  const isLeading = currentBidder?.teamId === teamId;
  const myPlayers = players.filter((p) => p.sold_to === myTeam?.name);

  const increment = currentBid
    ? currentBid < 1000000 ? 100000 : currentBid < 5000000 ? 500000 : 1000000
    : 0;
  const nextBid = currentBid ? currentBid + increment : 0;
  const canAfford = myTeam && nextBid <= myTeam.purse_remaining;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.badge}>🏏 Captain</span>
          <span className={styles.teamTitle}>{myTeam?.name} — {myTeam?.captain_name}</span>
        </div>
        <button className={styles.exitBtn} onClick={() => setRole(null)}>Exit</button>
      </header>

      <div className={styles.purseRow}>
        <div className={styles.purseCard}>
          <label>Your Purse</label>
          <span className={styles.purseAmount}>{formatCurrency(myTeam?.purse_remaining || 0)}</span>
        </div>
        <div className={styles.purseCardDim}>
          <label>{otherTeam?.name} Purse</label>
          <span>{formatCurrency(otherTeam?.purse_remaining || 0)}</span>
        </div>
      </div>

      <main className={styles.main}>
        {phase !== "LIVE" || !currentPlayer ? (
          <div className={styles.waiting}>
            <div className={styles.waitingIcon}>⏳</div>
            <p>Waiting for auctioneer to put up a player...</p>
          </div>
        ) : (
          <div className={styles.liveBox}>
            <div className={styles.liveBadge}>🔴 LIVE</div>
            <div className={styles.playerName}>{currentPlayer.name}</div>
            <div className={styles.categoryBadge} style={{ background: CATEGORY_COLORS[currentPlayer.category]?.bg, color: CATEGORY_COLORS[currentPlayer.category]?.text }}>
              {currentPlayer.category}
            </div>
            <div className={styles.bidAmount}>{formatCurrency(currentBid)}</div>

            {isLeading ? (
              <div className={styles.leadingTag}>✅ You're leading!</div>
            ) : currentBidder ? (
              <div className={styles.outbidTag}>Leading: {currentBidder.teamName}</div>
            ) : (
              <div className={styles.outbidTag}>No bids yet — base price</div>
            )}

            <button
              className={styles.bidBtn}
              onClick={() => placeBid(teamId)}
              disabled={isLeading || !canAfford}
            >
              {isLeading ? "You're Leading" : !canAfford ? "Not Enough Purse" : `Bid ${formatCurrency(nextBid)}`}
            </button>
          </div>
        )}
      </main>

      {bidHistory.length > 0 && (
        <div className={styles.bidHistory}>
          {bidHistory.slice(0, 4).map((b, i) => (
            <div key={i} className={styles.bidRow}>
              <span>{b.teamName}</span>
              <span>{formatCurrency(b.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.squad}>
        <h3>Your Squad ({myPlayers.length})</h3>
        <div className={styles.squadGrid}>
          {myPlayers.map((p) => (
            <div key={p.id} className={styles.squadCard}>
              <span>{p.name}</span>
              <span className={styles.squadPrice}>{formatCurrency(p.sold_price)}</span>
            </div>
          ))}
          {myPlayers.length === 0 && <p className={styles.empty}>No players yet</p>}
        </div>
      </div>
    </div>
  );
}
