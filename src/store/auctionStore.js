import { create } from "zustand";
import { supabase } from "../lib/supabase";

const getIncrement = (currentBid) => {
  if (currentBid < 1000000) return 100000;
  if (currentBid < 5000000) return 500000;
  return 1000000;
};

export const useAuctionStore = create((set, get) => ({
  players: [],
  teams: [],
  currentPlayer: null,
  currentBid: null,
  currentBidder: null,
  bidHistory: [],
  phase: "WAITING",
  role: null,
  loading: true,
  _initialized: false,
  _subscribed: false,

  setRole: (role) => set({ role }),

  init: async () => {
    if (get()._initialized) return;
    set({ _initialized: true });

    const [{ data: players }, { data: teams }, { data: auctionState }, { data: bids }] = await Promise.all([
      supabase.from("players").select("*").order("id"),
      supabase.from("teams").select("*").order("id"),
      supabase.from("auction_state").select("*").eq("id", 1).single(),
      supabase.from("bid_history").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    const currentPlayer = auctionState?.current_player_id
      ? players.find((p) => p.id === auctionState.current_player_id)
      : null;

    const currentBidderTeam = auctionState?.current_bidder_team_id
      ? teams.find((t) => t.id === auctionState.current_bidder_team_id)
      : null;

    set({
      players: players || [],
      teams: teams || [],
      currentPlayer,
      currentBid: auctionState?.current_bid || null,
      currentBidder: currentBidderTeam ? { teamId: currentBidderTeam.id, teamName: currentBidderTeam.name } : null,
      phase: auctionState?.phase || "WAITING",
      bidHistory: (bids || []).map((b) => ({ teamName: b.team_name, amount: b.amount, timestamp: b.created_at })),
      loading: false,
    });

    get().subscribeRealtime();
  },

  subscribeRealtime: () => {
    if (get()._subscribed) return;
    set({ _subscribed: true });

    supabase
      .channel("auction-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "auction_state" }, async (payload) => {
        const newState = payload.new;
        const { players, teams } = get();
        const currentPlayer = newState.current_player_id ? players.find((p) => p.id === newState.current_player_id) : null;
        const currentBidderTeam = newState.current_bidder_team_id ? teams.find((t) => t.id === newState.current_bidder_team_id) : null;
        set({
          currentPlayer,
          currentBid: newState.current_bid,
          currentBidder: currentBidderTeam ? { teamId: currentBidderTeam.id, teamName: currentBidderTeam.name } : null,
          phase: newState.phase,
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, async () => {
        const { data } = await supabase.from("teams").select("*").order("id");
        set({ teams: data || [] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, async () => {
        const { data } = await supabase.from("players").select("*").order("id");
        set({ players: data || [] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bid_history" }, (payload) => {
        const b = payload.new;
        set({ bidHistory: [{ teamName: b.team_name, amount: b.amount, timestamp: b.created_at }, ...get().bidHistory].slice(0, 10) });
      })
      .subscribe();
  },

  putUpForAuction: async (playerId) => {
    const player = get().players.find((p) => p.id === playerId);
    await supabase.from("auction_state").update({
      current_player_id: playerId,
      current_bid: player.base_price,
      current_bidder_team_id: null,
      phase: "LIVE",
    }).eq("id", 1);
    await supabase.from("bid_history").delete().neq("id", 0);
    set({ bidHistory: [] });
  },

  placeBid: async (teamId) => {
    const { teams, currentBid } = get();
    const team = teams.find((t) => t.id === teamId);
    const increment = getIncrement(currentBid);
    const newBid = currentBid + increment;
    if (team.purse_remaining < newBid) return;

    await supabase.from("auction_state").update({
      current_bid: newBid,
      current_bidder_team_id: teamId,
    }).eq("id", 1);

    await supabase.from("bid_history").insert({ team_name: team.name, amount: newBid });
  },

  confirmSale: async () => {
    const { currentPlayer, currentBid, currentBidder, teams } = get();
    if (!currentBidder) return;
    const team = teams.find((t) => t.id === currentBidder.teamId);

    await supabase.from("teams").update({
      purse_remaining: team.purse_remaining - currentBid,
      players: [...team.players, currentPlayer.id],
    }).eq("id", team.id);

    await supabase.from("players").update({
      status: "SOLD",
      sold_price: currentBid,
      sold_to: currentBidder.teamName,
    }).eq("id", currentPlayer.id);

    await supabase.from("auction_state").update({
      current_player_id: null,
      current_bid: null,
      current_bidder_team_id: null,
      phase: "SOLD",
    }).eq("id", 1);
  },

  markUnsold: async () => {
    const { currentPlayer } = get();
    await supabase.from("players").update({ status: "UNSOLD" }).eq("id", currentPlayer.id);
    await supabase.from("auction_state").update({
      current_player_id: null,
      current_bid: null,
      current_bidder_team_id: null,
      phase: "UNSOLD",
    }).eq("id", 1);
  },
}));
