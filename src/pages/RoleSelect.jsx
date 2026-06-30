import { useState } from "react";
import { useAuctionStore } from "../store/auctionStore";
import styles from "./RoleSelect.module.css";

// Simple PINs to stop randoms from grabbing control roles.
// Change these to whatever you want before sharing the link.
const PINS = {
  AUCTIONEER: "1111",
  CAPTAIN_1: "2222",
  CAPTAIN_2: "3333",
};

const roles = [
  { label: "🎙️ Auctioneer", value: "AUCTIONEER", sub: "Run the auction", locked: true },
  { label: "🏏 Sriman", value: "CAPTAIN_1", sub: "Captain · SS", locked: true },
  { label: "🏏 Stalin", value: "CAPTAIN_2", sub: "Captain · PSK", locked: true },
  { label: "👀 Audience", value: "AUDIENCE", sub: "Watch only", locked: false },
];

export default function RoleSelect() {
  const setRole = useAuctionStore((s) => s.setRole);
  const [pendingRole, setPendingRole] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");

  const handleClick = (r) => {
    if (!r.locked) {
      setRole(r.value);
      return;
    }
    setPendingRole(r.value);
    setPinInput("");
    setError("");
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === PINS[pendingRole]) {
      setRole(pendingRole);
    } else {
      setError("Wrong PIN");
    }
  };

  if (pendingRole) {
    return (
      <div className={styles.container}>
        <form className={styles.pinBox} onSubmit={handlePinSubmit}>
          <p className={styles.pinLabel}>Enter PIN</p>
          <input
            className={styles.pinInput}
            type="password"
            inputMode="numeric"
            autoFocus
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
          />
          {error && <p className={styles.pinError}>{error}</p>}
          <div className={styles.pinBtns}>
            <button type="button" className={styles.backBtn} onClick={() => setPendingRole(null)}>Back</button>
            <button type="submit" className={styles.confirmBtn}>Enter</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.trophy}>🏆</div>
        <h1 className={styles.title}>Friend Cricket Auction</h1>
        <p className={styles.sub}>Select your role to enter</p>
      </div>
      <div className={styles.grid}>
        {roles.map((r) => (
          <button key={r.value} className={styles.card} onClick={() => handleClick(r)}>
            <span className={styles.label}>{r.label}</span>
            <span className={styles.cardSub}>{r.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
