export const WS_URL =
  process.env.NODE_ENV === "production"
    ? "wss://votre-nom-app.railway.app"
    : `ws://${window.location.hostname}:3002`;

export const ROLES = {
  GAME: "game",
  REMOTE: "remote",
};

export const MESSAGE_TYPES = {
  REGISTER: "register",
  GAME_STATE: "gameState",
  BUTTON_CLICK: "buttonClick",
  GAME_CONNECTED: "gameConnected",
  GAME_DISCONNECTED: "gameDisconnected",
};
