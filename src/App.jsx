import { useEffect } from "react";
import { useAuctionStore } from "./store/auctionStore";
import RoleSelect from "./pages/RoleSelect";
import Auctioneer from "./pages/Auctioneer";
import Captain from "./pages/Captain";
import Audience from "./pages/Audience";

export default function App() {
  const role = useAuctionStore((s) => s.role);
  const loading = useAuctionStore((s) => s.loading);
  const init = useAuctionStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontFamily: "sans-serif" }}>
        Loading auction...
      </div>
    );
  }

  if (!role) return <RoleSelect />;
  if (role === "AUCTIONEER") return <Auctioneer />;
  if (role === "CAPTAIN_1") return <Captain teamId={1} />;
  if (role === "CAPTAIN_2") return <Captain teamId={2} />;
  if (role === "AUDIENCE") return <Audience />;

  return null;
}
