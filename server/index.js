const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const http = require("http");

const PORT = process.env.PORT || 3003;

// Créer un serveur HTTP
const server = http.createServer();

// Configurer le serveur WebSocket avec le serveur HTTP
const wss = new WebSocket.Server({
  server,
  perMessageDeflate: false,
  clientTracking: true,
  verifyClient: (info) => {
    const origin = info.origin || info.req.headers.origin;
    // En développement, accepter localhost
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    // En production, vérifier l'origine
    const allowedOrigins = [
      "https://qvgdm-two.vercel.app",
      "https://qvgdm-two-git-main.vercel.app",
      "http://localhost:3000",
    ];
    return allowedOrigins.includes(origin);
  },
});

// Gestion des connexions
let gameConnection = null;
let isGameConnected = false;
const clients = new Map();

// État initial du jeu
const initialGameState = {
  currentScreen: "start",
  showNextButton: false,
  showValidateButton: false,
  selectedAnswers: [],
  isDoubleChanceActive: false,
  isValidating: false,
  question: null,
  jokers: {
    phoneCall: true,
    fiftyFifty: true,
    doubleChance: true,
  },
  hiddenAnswers: [],
  showPartSelection: false,
};

let gameState = { ...initialGameState };

// Diffuser aux télécommandes
function broadcastToRemotes(message) {
  clients.forEach((client, clientId) => {
    if (client.role === "remote" && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

// Gérer la connexion du jeu principal
function handleGameConnection(ws, clientId) {
  if (isGameConnected) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Un jeu est déjà connecté",
      })
    );
    return false;
  }
  gameConnection = ws;
  isGameConnected = true;
  console.log(`[${new Date().toISOString()}] Jeu connecté - ID: ${clientId}`);
  broadcastToRemotes({ type: "gameConnected" });
  return true;
}

// Gérer l'enregistrement des clients
function handleRegister(ws, clientId, role) {
  if (role === "game") {
    if (!handleGameConnection(ws, clientId)) {
      return;
    }
  }

  clients.set(clientId, { ws, role });
  ws.send(
    JSON.stringify({
      type: "registered",
      sessionId: clientId,
    })
  );

  if (role === "remote") {
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          type: "gameState",
          state: gameState,
        })
      );
      ws.send(
        JSON.stringify({
          type: isGameConnected ? "gameConnected" : "gameDisconnected",
        })
      );
    }, 500);
  }
}

wss.on("connection", (ws) => {
  const clientId = uuidv4();

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "register":
          handleRegister(ws, clientId, data.role);
          break;

        case "gameState":
          if (clients.get(clientId)?.role === "game") {
            Object.assign(gameState, data.state);
            broadcastToRemotes({
              type: "gameState",
              state: gameState,
            });
          }
          break;

        case "buttonClick":
          if (clients.get(clientId)?.role === "remote" && gameConnection) {
            console.log("Server: Transmission action remote vers jeu", data);
            gameConnection.send(JSON.stringify(data));
          }
          break;
      }
    } catch (error) {
      console.error("Erreur de traitement du message:", error);
    }
  });

  ws.on("close", () => {
    const client = clients.get(clientId);
    if (client?.role === "game") {
      gameConnection = null;
      isGameConnected = false;
      // Réinitialiser l'état quand le jeu se déconnecte
      gameState = { ...initialGameState };
      broadcastToRemotes({
        type: "gameDisconnected",
      });
      // Envoyer le nouvel état aux télécommandes
      broadcastToRemotes({
        type: "gameState",
        state: gameState,
      });
    }
    clients.delete(clientId);
  });
});

// Démarrer le serveur HTTP au lieu du serveur WebSocket directement
server.listen(PORT, () => {
  console.log(`[Server] WebSocket server is listening on port ${PORT}`);
});
