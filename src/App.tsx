import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  Play,
  Square,
  RefreshCw,
  GlassWater,
  AlertTriangle,
  Mic,
  Wine,
  Sparkles,
  Crown,
} from "lucide-react";

// ==================================================================
// CONFIGURAÇÃO DO FIREBASE (MANTENHA SUAS CHAVES AQUI!)
// ==================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDL8oRGiBuz6qFEoj0F76c4_JhjtafRgEQ", // Cole sua API Key aqui
  authDomain: "praia-2026.firebaseapp.com", // Cole seu Auth Domain
  projectId: "praia-2026", // Cole seu Project ID
  storageBucket: "praia-2026.firebasestorage.app", // Cole seu Storage Bucket
  messagingSenderId: "393183104266", // Cole seu Messaging Sender ID
  appId: "1:393183104266:web:55f1ee8fca3f0f34cc3ef3", // <--- MANTENHA SUAS CHAVES AQUI
};

const isConfigured = firebaseConfig.apiKey.length > 0;

let app: any;
let auth: any;
let db: any;

const appId = "praia-2026-game";

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Erro ao iniciar Firebase:", error);
  }
}

// ==================================================================
// COMPONENTE SPLASH SCREEN (DESIGN SINCRONIZADO COM HTML)
// ==================================================================
const SplashScreen = () => (
  <div
    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center pointer-events-none"
    style={{
      background:
        "radial-gradient(circle at center top, #ff8c69 0%, #2e1065 70%, #100c30 100%)",
      transition: "opacity 0.6s ease-out",
    }}
  >
    {/* Container da Logo com animação de flutuar */}
    <div
      className="relative w-[160px] h-[160px] rounded-[35px] overflow-hidden bg-black"
      style={{
        boxShadow:
          "0 0 0 4px rgba(255, 255, 255, 0.1), 0 20px 50px rgba(0,0,0,0.5)",
        animation: "float 4s ease-in-out infinite",
      }}
    >
      <img
        src="/icon.jpg"
        alt="Loading"
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    </div>

    {/* Loader igual ao do HTML */}
    <div className="mt-10 w-10 h-10 border-4 border-white/20 border-t-[#fbbf24] rounded-full animate-spin" />

    {/* Texto pulsante */}
    <div
      className="mt-5 text-white/90 text-xs font-bold tracking-[3px] uppercase"
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        animation: "pulseText 2s infinite",
      }}
    >
      Carregando o rolê...
    </div>

    {/* Definição das animações locais para garantir igualdade */}
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-10px) scale(1.02); }
      }
      @keyframes pulseText { 
        0%, 100% { opacity: 0.6; } 
        50% { opacity: 1; } 
      }
    `}</style>
  </div>
);

// ==================================================================
// LISTA DE CARTAS
// ==================================================================
const CARD_TEMPLATES = [
  "Todos bebem 1 gole para começar bem.",
  "Homens bebem.",
  "Mulheres bebem.",
  "Quem estiver de camisa preta bebe.",
  "Quem estiver de chinelo bebe.",
  "Quem estiver de óculos (ou lentes) bebe.",
  "O mais novo da roda bebe 2 goles.",
  "O mais velho da roda distribui 2 goles.",
  "Quem tiver tatuagem bebe.",
  "Quem NÃO tiver tatuagem bebe.",
  "Crie uma regra: Quem falar a palavra 'NÃO' bebe.",
  "Crie uma regra: Proibido chamar os outros pelo nome.",
  "Quem está segurando o celular agora bebe.",
  "O último a colocar a mão na mesa bebe.",
  "O último a levantar a mão para o céu bebe.",
  "Eu nunca: Quem já vomitou bebendo bebe.",
  "Eu nunca: Quem já beijou ex bebe.",
  "Escolha alguém para ser seu parceiro de bebida (se você bebe, ele bebe).",
  "O mestre mandou: Faça uma pose, quem imitar por último bebe.",
  "Advinhação: Quem errar a cor da cueca/calcinha de quem puxou a carta bebe.",
  "Todos que nasceram no primeiro semestre (Jan-Jun) bebem.",
  "Todos que nasceram no segundo semestre (Jul-Dez) bebem.",
  "Quem tiver Android bebe.",
  "Quem tiver iPhone bebe.",
  "Faça uma careta. Quem rir primeiro bebe.",
  "Conte uma piada. Se ninguém rir, você bebe.",
  "A pessoa à sua direita bebe.",
  "A pessoa à sua esquerda bebe.",
  "Vote em quem é o mais provável de casar primeiro. O mais votado bebe.",
  "Vote em quem é o mais provável de ser preso. O mais votado bebe.",
  "{player} bebe 2 goles.",
  "{player} escolhe alguém para beber.",
  "{player} conta uma verdade ou bebe.",
  "Todos bebem de braços cruzados com quem está ao lado.",
  "Rodada de Marcas de Carro: Quem travar ou repetir bebe.",
  "Rodada de Times de Futebol: Quem travar ou repetir bebe.",
  "Rodada de Cores: Quem travar ou repetir bebe.",
  "Quem estiver de pé bebe.",
  "Quem estiver sentado bebe.",
  "Anula uma regra anterior (se houver).",
  "Passe a vez sem beber.",
  "Escolha uma regra para ser cancelada.",
  "Tire uma selfie com o grupo. Quem sair de olho fechado bebe.",
  "Quem estiver usando relógio bebe.",
  "Seu copo virou comunitário: Todos dão um gole no seu copo.",
  "Vire o seu copo (se tiver pouco) ou beba 3 goles.",
  "Dê um shot de água para hidratar (obrigatório).",
  "Quem tem piercing bebe.",
  "Quem tem animal de estimação bebe.",
  "Quem está namorando bebe.",
  "Quem está solteiro bebe.",
  "Pedra, Papel, Tesoura com a pessoa da frente. Perdedor bebe.",
  "Faça um brinde a algo aleatório. Todos bebem.",
  "Mímica: Imite um animal. Quem não acertar em 10s bebe.",
  "{player} vira o 'Mestre do Polegar'. Sempre que ele colocar o polegar na mesa, todos devem colocar. O último bebe.",
  "Quem estiver com a bateria do celular abaixo de 20% bebe.",
];

const GoldLines = () => (
  <>
    <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-yellow-500/40 rounded-tl-3xl opacity-60 pointer-events-none" />
    <div className="absolute top-4 left-4 w-24 h-24 border-l border-t border-yellow-300/30 rounded-tl-2xl opacity-40 pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-yellow-500/40 rounded-br-3xl opacity-60 pointer-events-none" />
    <svg
      className="absolute top-0 right-0 w-40 h-40 opacity-20 pointer-events-none text-yellow-500"
      viewBox="0 0 100 100"
    >
      <path
        d="M0,0 Q50,50 100,0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M20,0 Q60,40 100,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
    <svg
      className="absolute bottom-0 left-0 w-40 h-40 opacity-20 pointer-events-none text-yellow-500 transform rotate-180"
      viewBox="0 0 100 100"
    >
      <path
        d="M0,0 Q50,50 100,0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M20,0 Q60,40 100,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  </>
);

export default function PraiaGame() {
  const [user, setUser] = useState<any>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [tempPlayers, setTempPlayers] = useState<string[]>([]);
  const [showConfirmStop, setShowConfirmStop] = useState(false);
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  // EFEITO: Remover Splash Screen do HTML quando o React carregar
  useEffect(() => {
    // Pequeno delay para garantir que o React renderizou o background
    setTimeout(() => {
      const splash = document.getElementById("splash-screen");
      if (splash) {
        splash.style.opacity = "0";
        setTimeout(() => splash.remove(), 600);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (!isConfigured || !auth) return;
    signInAnonymously(auth).catch((err: any) =>
      console.error("Erro auth:", err)
    );
    const unsubscribeAuth = onAuthStateChanged(auth, (u: any) => setUser(u));
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () =>
        setNewVersionAvailable(true)
      );
    }
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !db || !isConfigured) return;
    const gameDocRef = doc(db, "praia2026", "session_01");
    const unsubscribe = onSnapshot(
      gameDocRef,
      (docSnap: any) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.lastAction) {
            const lastActionTime = data.lastAction.toMillis
              ? data.lastAction.toMillis()
              : 0;
            if (
              Date.now() - lastActionTime > 30 * 60 * 1000 &&
              data.status === "PLAYING"
            ) {
              resetGameDueToInactivity();
              return;
            }
          }
          setGameData(data);
        } else {
          setDoc(gameDocRef, {
            status: "LOBBY",
            players: [],
            turnIndex: 0,
            currentCard: null,
            hostId: null,
            lastAction: serverTimestamp(),
          });
        }
        setLoading(false);
      },
      (error: any) => {
        console.error("Erro snapshot:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const resetGameDueToInactivity = async () => {
    if (!db) return;
    await setDoc(doc(db, "praia2026", "session_01"), {
      status: "LOBBY",
      players: [],
      turnIndex: 0,
      currentCard: null,
      hostId: null,
      lastAction: serverTimestamp(),
    });
    alert("Reiniciado por inatividade.");
  };

  const addPlayerLocally = () => {
    if (playerName.trim()) {
      setTempPlayers([...tempPlayers, playerName.trim()]);
      setPlayerName("");
    }
  };

  const startGame = async () => {
    if (tempPlayers.length === 0 || !db || !user) return;
    await updateDoc(doc(db, "praia2026", "session_01"), {
      status: "PLAYING",
      players: tempPlayers,
      turnIndex: 0,
      hostId: user.uid,
      currentCard: { text: "Toque na carta para começar!", type: "info" },
      lastAction: serverTimestamp(),
    });
  };

  const drawCard = async () => {
    if (!gameData || !user || !db) return;
    if (gameData.hostId && gameData.hostId !== user.uid) return;

    const randomIndex = Math.floor(Math.random() * CARD_TEMPLATES.length);
    let cardText = CARD_TEMPLATES[randomIndex];

    if (cardText.includes("{player}") && gameData.players.length > 0) {
      const randomPlayer =
        gameData.players[Math.floor(Math.random() * gameData.players.length)];
      cardText = cardText.replace("{player}", randomPlayer);
    }
    const nextTurnIndex = (gameData.turnIndex + 1) % gameData.players.length;

    await updateDoc(doc(db, "praia2026", "session_01"), {
      currentCard: { text: cardText, type: "action", id: Date.now() },
      turnIndex: nextTurnIndex,
      lastAction: serverTimestamp(),
    });
  };

  const stopGame = async () => {
    if (!db) return;
    await updateDoc(doc(db, "praia2026", "session_01"), {
      status: "LOBBY",
      players: [],
      turnIndex: 0,
      currentCard: null,
      hostId: null,
      lastAction: serverTimestamp(),
    });
    setTempPlayers([]);
    setShowConfirmStop(false);
  };

  const reloadPage = () => window.location.reload();

  if (!isConfigured)
    return (
      <div className="p-10 text-white bg-gray-900">
        Configure as chaves no código!
      </div>
    );

  // Se ainda estiver carregando (Auth ou Firebase), mantemos a Splash Screen do React
  if (loading) return <SplashScreen />;

  const isHost = gameData?.hostId === user?.uid;
  const currentPlayerName =
    gameData?.players?.[gameData?.turnIndex] || "Alguém";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1b4b] to-[#2e1065] font-sans text-gray-100 overflow-hidden relative selection:bg-yellow-500 selection:text-indigo-900">
      {/* Background Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] opacity-10 animate-pulse">
          <Sparkles size={40} className="text-yellow-200" />
        </div>
        <div className="absolute bottom-[30%] left-[5%] opacity-10 animate-pulse delay-700">
          <Sparkles size={24} className="text-yellow-200" />
        </div>
      </div>

      {newVersionAvailable && (
        <div
          className="fixed top-0 left-0 w-full bg-yellow-500 text-indigo-900 p-3 z-50 flex justify-between items-center shadow-lg cursor-pointer font-bold"
          onClick={reloadPage}
        >
          <span className="text-sm">Nova versão disponível! Toque aqui.</span>
          <RefreshCw size={16} />
        </div>
      )}

      {/* HEADER */}
      <header className="p-6 flex justify-between items-center relative z-10 pt-safe-top">
        <div className="flex flex-col">
          <h1 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 font-bold tracking-widest drop-shadow-sm">
            PRAIA 2026
          </h1>
          <span className="text-[10px] text-yellow-500/60 uppercase tracking-[0.2em]">
            O Jogo
          </span>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-yellow-100">
            {gameData?.status === "PLAYING" ? "AO VIVO" : "LOBBY"}
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-2 max-w-md h-[calc(100vh-100px)] flex flex-col relative z-10 pb-safe-bottom">
        {gameData?.status === "LOBBY" ? (
          <div className="flex-1 flex flex-col justify-center animate-fadeIn">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <GlassWater className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-serif text-white mb-1">
                  Novo Jogo
                </h2>
                <p className="text-indigo-200 text-sm font-light">
                  Preparem os copos e os nomes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Nome do participante..."
                    className="flex-1 px-4 py-4 rounded-xl border border-white/10 bg-black/20 text-white placeholder-indigo-300/50 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                    onKeyDown={(e) => e.key === "Enter" && addPlayerLocally()}
                  />
                  <button
                    onClick={addPlayerLocally}
                    className="bg-yellow-500 text-indigo-900 w-14 rounded-xl font-bold shadow-lg hover:bg-yellow-400 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {tempPlayers.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center text-yellow-300 font-bold text-xs border border-white/10">
                        {i + 1}
                      </div>
                      <span className="font-medium text-indigo-100">{p}</span>
                    </div>
                  ))}
                  {tempPlayers.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-indigo-400/60 text-sm">
                        Lista vazia...
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={startGame}
                  disabled={tempPlayers.length === 0}
                  className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 border border-white/20 text-white py-4 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Play size={20} fill="currentColor" /> INICIAR
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-3">
                <span className="text-xs text-indigo-300 uppercase tracking-widest">
                  Vez de
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span className="text-yellow-100 font-bold text-lg">
                    {currentPlayerName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative perspective-1000">
              <div className="relative w-full max-w-[340px] aspect-[3/4]">
                <div
                  onClick={drawCard}
                  className={`
                      relative w-full h-full bg-gradient-to-br from-[#1e1b4b] to-[#312e81]
                      rounded-[2.5rem] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)] 
                      border border-white/10 overflow-hidden
                      flex flex-col items-center text-center p-8
                      transition-all duration-300 group
                      ${
                        isHost
                          ? "cursor-pointer hover:-translate-y-2 hover:shadow-yellow-900/20"
                          : ""
                      }
                    `}
                >
                  <GoldLines />

                  <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
                    {!gameData.currentCard ? (
                      <div className="opacity-40 flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full border-2 border-white/20">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                        <p className="font-serif text-indigo-200 italic">
                          Toque para iniciar...
                        </p>
                      </div>
                    ) : (
                      <div className="animate-popIn flex flex-col h-full justify-between py-4">
                        <div className="flex justify-center gap-4 text-yellow-500/80 mb-4">
                          <Mic size={24} strokeWidth={1.5} />
                          <Wine size={24} strokeWidth={1.5} />
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed drop-shadow-md">
                            {gameData.currentCard.text}
                          </p>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-6 w-full flex flex-col gap-2">
                          <div className="flex justify-center items-center gap-2 text-indigo-300 text-sm">
                            <span>Vez de:</span>
                            <strong className="text-yellow-400 uppercase tracking-wide">
                              {currentPlayerName}
                            </strong>
                          </div>
                          <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold mt-2">
                            Praia 2026
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isHost && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-teal-500 to-teal-400/90 py-3 flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-widest shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                      <Crown size={14} fill="currentColor" /> Você é o Mestre
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 mb-4">
              <div className="flex flex-wrap justify-center gap-2 opacity-70">
                {gameData.players.map((p: any, i: number) => (
                  <div
                    key={i}
                    className={`
                        px-3 py-1 rounded-full text-[10px] font-bold border transition-all
                        ${
                          i === gameData.turnIndex
                            ? "bg-yellow-500 text-indigo-900 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/20"
                            : "bg-white/5 text-indigo-300 border-white/10"
                        }
                    `}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <div className="flex justify-center pb-6">
                <button
                  onClick={() => setShowConfirmStop(true)}
                  className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors py-2 px-4 rounded-lg hover:bg-red-500/10"
                >
                  <Square size={10} fill="currentColor" /> Encerrar Partida
                </button>
              </div>
            )}

            {!isHost && (
              <div className="text-center pb-8 opacity-50">
                <p className="text-indigo-200 text-xs flex items-center justify-center gap-2">
                  <span>👁️</span> Assistindo a partida de {gameData.players[0]}
                  ...
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {showConfirmStop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#1e1b4b] border border-white/10 rounded-3xl p-8 max-w-xs w-full shadow-2xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto border border-red-500/30">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-serif text-white mb-2">Encerrar?</h3>
            <p className="text-indigo-300 text-sm mb-6 leading-relaxed">
              Tem certeza? Isso vai apagar a rodada e voltar para o lobby.
            </p>
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => setShowConfirmStop(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors border border-white/10"
              >
                VOLTAR
              </button>
              <button
                onClick={stopGame}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-red-900/30"
              >
                ENCERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-popIn { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .pt-safe-top { padding-top: env(safe-area-inset-top); }
        .pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}
