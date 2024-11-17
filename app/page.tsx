"use client";
import GlobalChat from "./components/GlobalChat";
import { useEffect, useState } from "react";
import {
  Home,
  User,
  Camera,
  Send,
  Clock,
  CloudRain,
  AlertTriangle,
} from "lucide-react";
import { useGlobalContext } from "./store/globalContext";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Briefcase,
  Coffee,
  Store,
  Tree,
  MapLocation,
  TrumanIndicator,
  calculateSuspicionIncrease,
  StatusBadge,
  WorldState,
  ChatMessage,
  parseConversationText,
} from "./components";
import ResultsModal from "./components/ResultsModal";

// Add these types
interface WorldState {
  weather: string;
  timeOfDay: string;
  currentEvent: string | null;
  suspicionMeter: number;
  viewerCount: string;
}

interface ChatMessage {
  from: string;
  text: string;
}

// First, add this helper function to parse conversation text
const parseConversationText = (text: string) => {
  // Split by newlines and filter empty lines
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => {
      // Try to extract speaker and message
      const match = line.match(/^(.*?):\s*(.*)$/);
      if (match) {
        return {
          speaker: match[1].trim(),
          message: match[2].trim(),
        };
      }
      return null;
    })
    .filter((item) => item !== null);
};

export default function TrumanWorldApp() {
  // Add global context
  const { addEvent, cleanup } = useGlobalContext();

  // Combine state from both components

  // From GameMap:
  const [trumanPosition, setTrumanPosition] = useState({ x: 50, y: 50 });
  const [currentLocation, setCurrentLocation] = useState("home");

  const locations = {
    home: { x: 50, y: 50, icon: Home, label: "Truman's House" },
    work: { x: 80, y: 30, icon: Briefcase, label: "Insurance Office" },
    cafe: { x: 30, y: 40, icon: Coffee, label: "Cafe" },
    store: { x: 70, y: 70, icon: Store, label: "Store" },
    park: { x: 20, y: 60, icon: Tree, label: "Park" },
  };

  // From TrumanWorld:
  // Game state
  const [worldState, setWorldState] = useState<WorldState>({
    weather: "Sunny",
    timeOfDay: "Morning",
    currentEvent: null,
    suspicionMeter: 20,
    viewerCount: "1.2M",
  });

  const [recentEvents, setRecentEvents] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleSendMessageToWorldAi = async (message: string) => {
    // Check if message is a command
    if (message.startsWith("/")) {
      const [command, ...args] = message.slice(1).split(" ");

      switch (command.toLowerCase()) {
        case "bet": {
          if (args.length < 2) {
            setChatMessages((prev) => [
              ...prev,
              {
                from: "System",
                text: "Usage: /bet <amount> <prediction> - Example: /bet 0.001 'Truman will discover a camera'",
              },
            ]);
            return;
          }

          const amount = parseFloat(args[0]);
          const prediction = args.slice(1).join(" ");

          if (isNaN(amount) || amount <= 0) {
            setChatMessages((prev) => [
              ...prev,
              {
                from: "System",
                text: "Please specify a valid betting amount in ETH",
              },
            ]);
            return;
          }

          try {
            const response = await fetch("/api/world-ai-bet", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount,
                prediction,
                worldState,
                recentEvents,
                chatHistory: chatMessages,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to place bet");
            }

            const data = await response.json();

            // Add bet to active bets
            setBets((prev) => [
              ...prev,
              {
                id: data.betId,
                question: prediction,
                options: ["Yes", "No"],
                endTime: "1 hour",
                pool: amount,
                odds: { Yes: 2.0, No: 2.0 },
              },
            ]);

            // Add confirmation message
            setChatMessages((prev) => [
              ...prev,
              { from: "User", text: message },
              {
                from: "System",
                text: `Bet placed: ${amount} ETH on "${prediction}"`,
              },
            ]);

            toast(`New bet created: ${amount} ETH on "${prediction}"`, {
              type: "success",
            });
          } catch (error) {
            console.error("Error placing bet:", error);
            setChatMessages((prev) => [
              ...prev,
              { from: "User", text: message },
              {
                from: "System",
                text: "Failed to place bet. Please try again.",
              },
            ]);
          }
          break;
        }

        case "help": {
          setChatMessages((prev) => [
            ...prev,
            { from: "User", text: message },
            {
              from: "System",
              text: `Available commands:
/bet <amount> <prediction> - Place a new bet
/help - Show this help message
/status - Show current world state
/events - Show recent events`,
            },
          ]);
          break;
        }

        case "status": {
          const statusMessage = `Current World State:
• Weather: ${worldState.weather}
• Time: ${worldState.timeOfDay}
• Suspicion Level: ${worldState.suspicionMeter}%
• Viewer Count: ${worldState.viewerCount}
${
  worldState.currentEvent ? `• Current Event: ${worldState.currentEvent}` : ""
}`;

          setChatMessages((prev) => [
            ...prev,
            { from: "User", text: message },
            { from: "System", text: statusMessage },
          ]);
          break;
        }

        case "events": {
          if (recentEvents.length === 0) {
            setChatMessages((prev) => [
              ...prev,
              { from: "User", text: message },
              { from: "System", text: "No recent events to display." },
            ]);
            return;
          }

          const eventsMessage = `Recent Events:
${recentEvents
  .slice(-5)
  .map((event, i) => `${i + 1}. ${event}`)
  .join("\n")}`;

          setChatMessages((prev) => [
            ...prev,
            { from: "User", text: message },
            { from: "System", text: eventsMessage },
          ]);
          break;
        }

        default: {
          setChatMessages((prev) => [
            ...prev,
            { from: "User", text: message },
            {
              from: "System",
              text: "Unknown command. Type /help for available commands.",
            },
          ]);
        }
      }
      return;
    }

    // Handle regular chat messages
    setChatMessages((prev) => [...prev, { from: "User", text: message }]);

    try {
      const response = await fetch("/api/world-ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          chatHistory: chatMessages,
          worldState,
          recentEvents,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch World AI chat response");
      }

      const data = await response.json();

      // Add the World AI's response
      setChatMessages((prev) => [
        ...prev,
        {
          from: "World AI",
          text: data.response,
        },
      ]);

      // Check if the response should trigger any world state changes
      if (data.worldStateChanges) {
        setWorldState((prev) => ({
          ...prev,
          ...data.worldStateChanges,
        }));
      }

      // Check if the response should add any events
      if (data.newEvent) {
        setRecentEvents((prev) => [...prev, data.newEvent]);
      }
    } catch (error) {
      console.error("Error communicating with World AI:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          from: "System",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  const triggerWorldAi = async () => {
    console.log("Triggering World AI ... ");

    try {
      const response = await fetch("/api/world-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldState, recentEvents }),
      });
      console.log("World AI response", response);
      if (!response.ok) {
        throw new Error("Failed to fetch World AI response");
      }

      const data = await response.json();

      if (data.changes) {
        setWorldState((prev) => ({
          ...prev,
          ...data.changes,
          currentEvent: data.event,
        }));
      }

      setRecentEvents((prev) => [...prev, data.event]);
    } catch (error) {
      console.error("Error triggering World AI:", error);
    }
  };

  // Add World AI periodic trigger
  useEffect(() => {
    const interval = setInterval(() => {
      triggerWorldAi();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [worldState, recentEvents]);

  // Truman's state
  const [truman, setTruman] = useState({
    name: "Truman Burbank",
    currentMood: "Content",
    currentActivity: "Getting ready for work",
    routine: "Daily commute to insurance company",
    suspicionLevel: "Low",
    recentDiscoveries: [],
  });

  // Show actors
  const [actors, setActors] = useState([
    {
      name: "Meryl",
      role: "Wife",
      personality: "Product placement specialist",
      currentMood: "Anxious",
      currentActivity: "Preparing morning coffee",
      agenda: "Must promote new coffee brand",
      trustLevel: 90,
    },
    {
      name: "Marlon",
      role: "Best Friend",
      personality: "Crisis manager",
      currentMood: "Alert",
      currentActivity: "Watching neighborhood",
      agenda: "Keep Truman from discovering the truth",
      trustLevel: 95,
    },
  ]);

  const [isPlacingBet, setIsPlacingBet] = useState(false);
  // Active bets
  const [bets, setBets] = useState([
    {
      id: 1,
      question: "Will Truman notice today's staged event?",
      options: ["Yes", "No"],
      endTime: "1 hour",
      pool: 0.002, // Total pool size in ETH
      odds: { Yes: 2.0, No: 2.0 }, // Initial odds
    },
    {
      id: 2,
      question: "Will Truman try to leave Seahaven today?",
      options: ["Yes", "No"],
      endTime: "24 hours",
      pool: 0.002, // Total pool size in ETH
      odds: { Yes: 2.0, No: 2.0 }, // Initial odds
    },
  ]);

  const generateNewBet = async () => {
    const state = useGlobalContext.getState();

    try {
      const response = await fetch("/api/world-ai-bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldState,
          recentEvents: state.recentEvents,
          globalSuspicion: state.globalSuspicion,
        }),
      });
      console.log("World AI bets response", response);
      if (!response.ok) {
        throw new Error("Failed to fetch new bet from World AI");
      }

      const data = await response.json();

      // Add the new bet to the list
      setBets((prev) => [...prev, data.bet]);
    } catch (error) {
      console.error("Error generating new bet:", error);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      generateNewBet();
    }, 10000); // Every 20 seconds (adjust as needed)

    return () => clearInterval(interval);
  }, [worldState, recentEvents]);

  const [selectedActor, setSelectedActor] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [conversation, setConversation] = useState([]);
  const [agentConversations, setAgentConversations] = useState<{
    [key: string]: Array<{ from: string; text: string }>;
  }>({});

  // Function to get agent's response to user instruction
  const getAgentResponse = async (
    agentName: string,
    userInstruction: string
  ) => {
    try {
      const agentHistory = agentConversations[agentName] || [];

      const response = await fetch("/api/agent-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName, userInstruction, agentHistory }),
      });

      if (!response.ok) throw new Error("Failed to fetch agent response");

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error fetching agent response:", error);
      return "I'm not sure what you mean.";
    }
  };

  // Function for Truman's autonomous movement
  const trumanDecideNextAction = async () => {
    try {
      const response = await fetch("/api/truman-next-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspicionLevel: worldState.suspicionMeter,
          conversationHistory: conversation,
          currentLocation,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch Truman's next action");

      const data = await response.json();
      if (locations[data.nextAction]) {
        moveTruman(data.nextAction);
      }
    } catch (error) {
      console.error("Error determining Truman's next action:", error);
    }
  };

  // Function for autonomous agent actions
  const agentAutonomousActions = async () => {
    for (const agent of actors) {
      if (Math.random() > 0.3) continue;

      try {
        const response = await fetch("/api/agent-autonomous-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentName: agent.name,
            agentHistory: agentConversations[agent.name] || [],
          }),
        });

        if (!response.ok)
          throw new Error("Failed to fetch agent autonomous message");

        const data = await response.json();
        const conversationParts = parseConversationText(data.response);

        // Add each part of the conversation separately
        for (const part of conversationParts) {
          const messageType = part.speaker === "Truman" ? "response" : "action";

          setConversation((prev) => [
            ...prev,
            {
              type: messageType,
              from: part.speaker,
              text: part.message,
              suspicionIncrease:
                messageType === "response"
                  ? calculateSuspicionIncrease(part.message)
                  : 0,
            },
          ]);

          // Update agent conversations
          setAgentConversations((prev) => ({
            ...prev,
            [agent.name]: [
              ...(prev[agent.name] || []),
              { from: part.speaker, text: part.message },
            ],
          }));
        }
      } catch (error) {
        console.error("Error in autonomous agent action:", error);
      }
    }
  };

  // Simulate Truman's movement
  const moveTruman = (targetLocation) => {
    const target = locations[targetLocation];
    setCurrentLocation(targetLocation);

    // Add movement event to global context
    addEvent({
      type: "MOVEMENT",
      description: `Truman moved to ${target.label}`,
      location: targetLocation,
      actors: ["Truman"],
    });

    // Update Truman's current activity
    setTruman((prev) => ({
      ...prev,
      currentActivity: `Going to ${target.label}`,
    }));

    // Animate Truman's movement
    const steps = 20;
    const dx = (target.x - trumanPosition.x) / steps;
    const dy = (target.y - trumanPosition.y) / steps;

    let step = 0;
    const interval = setInterval(() => {
      if (step >= steps) {
        clearInterval(interval);
        return;
      }

      setTrumanPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      step++;
    }, 50);
  };

  // Handle Truman's response to actor instructions
  const getTrumanResponse = async (actorName, action) => {
    if (!action) return null;

    try {
      // Prepare conversation history
      const conversationHistory = conversation.map((msg) => ({
        from: msg.from,
        text: msg.text,
      }));

      const response = await fetch("/api/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorName, action, conversationHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      const responseText = data.response;

      // Analyze the response to adjust suspicion levels if needed
      const suspicionIncrease = calculateSuspicionIncrease(responseText);

      // Update the suspicion meter
      setWorldState((prev) => ({
        ...prev,
        suspicionMeter: Math.min(100, prev.suspicionMeter + suspicionIncrease),
      }));

      return {
        text: responseText,
        suspicionIncrease,
      };
    } catch (error) {
      console.error("Error fetching Truman response:", error);
      return {
        text: "I'm not sure I understand. Could you repeat that?",
        suspicionIncrease: 0,
      };
    }
  };

  // Update handleInstruction to use the new agent response system
  const handleInstruction = async () => {
    if (!instruction.trim() || !selectedActor) return;

    // Get agent's response to the instruction
    const agentResponse = await getAgentResponse(
      selectedActor.name,
      instruction
    );

    // Update agent's conversation history
    setAgentConversations((prev) => ({
      ...prev,
      [selectedActor.name]: [
        ...(prev[selectedActor.name] || []),
        { from: "User", text: instruction },
        { from: selectedActor.name, text: agentResponse },
      ],
    }));

    // Show agent's action in the conversation
    const actorAction = {
      type: "action",
      from: selectedActor.name,
      text: agentResponse,
    };

    setConversation((prev) => [...prev, actorAction]);
    setInstruction("");

    // Get Truman's response
    const trumanResponse = await getTrumanResponse(
      selectedActor.name,
      agentResponse
    );

    const newInteraction = {
      type: "response",
      from: "Truman",
      text: trumanResponse.text,
      suspicionIncrease: trumanResponse.suspicionIncrease,
    };

    setConversation((prev) => [...prev, newInteraction]);
  };

  // Set up autonomous behaviors
  useEffect(() => {
    // Truman's autonomous movement
    const trumanInterval = setInterval(() => {
      trumanDecideNextAction();
    }, 10000); // Every 5 seconds

    // Agents' autonomous actions
    const agentsInterval = setInterval(() => {
      agentAutonomousActions();
    }, 10000); // Every 10 seconds

    return () => {
      clearInterval(trumanInterval);
      clearInterval(agentsInterval);
    };
  }, [conversation, worldState.suspicionMeter, currentLocation]);

  // Add cleanup effect
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Get and log the current context state
      const state = useGlobalContext.getState();
      console.log("Current Global Context:", state);

      // Run cleanup
      cleanup();
    }, 30000);

    return () => clearInterval(cleanupInterval);
  }, [cleanup]);

  // Function to resolve bets
  const [betResults, setBetResults] = useState<
    Array<{ id: string; success: boolean; message: string }>
  >([]);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const resolveBets = async () => {
    try {
      const response = await fetch("/api/resolve-bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bets, // Send current bets
          eventHistory: recentEvents, // Send recent events
          worldState, // Send current world state if needed
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve bets");
      }

      const data = await response.json();

      // Set the results and show the modal
      setBetResults(data.results);
      setShowResultsModal(true);

      // Remove resolved bets from the state
      setBets((prevBets) =>
        prevBets.filter(
          (bet) => !data.results.some((result) => result.id === bet.id)
        )
      );
    } catch (error) {
      console.error("Error resolving bets:", error);
    }
  };
  const placeBet = (betId, choice) => {
    if (isPlacingBet) return; // Prevent multiple simultaneous bets

    setIsPlacingBet(true);
    console.log(`Placing bet on ${betId}: ${choice}`);

    // Simulate a loading delay
    setTimeout(() => {
      setBets((prevBets) =>
        prevBets.map((bet) => {
          if (bet.id === betId) {
            const betAmount = 0.001; // Amount bet in ETH
            const newPool = bet.pool + betAmount;

            // Calculate new odds
            const newOdds = { ...bet.odds };
            const otherChoice = bet.options.find((opt) => opt !== choice);

            // Calculate the new odds based on the new pool distribution
            newOdds[choice] = (
              newPool /
              (bet.pool / bet.odds[choice] + betAmount)
            ).toFixed(2);
            newOdds[otherChoice] = (
              newPool /
              (bet.pool / bet.odds[otherChoice])
            ).toFixed(2);

            return { ...bet, pool: newPool, odds: newOdds };
          }
          return bet;
        })
      );

      toast(`Bet placed: 0.001 ETH on ${choice}`, { type: "info" });
      setIsPlacingBet(false);
    }, 1000); // 1 second delay
  };

  useEffect(() => {
    const interval = setInterval(() => {
      resolveBets();
    }, 20000); // Every 20 seconds

    return () => clearInterval(interval);
  }, [bets, recentEvents, worldState]);

  return (
    <div className="h-screen bg-gray-900 text-white">
      {/* Add DynamicWidget */}
      <div className="absolute top-4 right-4 z-50">
        <DynamicWidget />
      </div>
      {showResultsModal && (
        <ResultsModal
          results={betResults}
          onClose={() => setShowResultsModal(false)}
        />
      )}
      {/* ToastContainer for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Main grid layout */}
      <div className="grid grid-cols-[1fr_400px] h-full">
        {/* Left Column - Main Content */}
        <div className="p-4 space-y-4 overflow-hidden flex flex-col">
          {/* Header with show status */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-red-500 animate-pulse" />
                  <h1 className="text-xl font-bold">The Truman Show</h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {worldState.timeOfDay}
                  </div>
                  <div className="flex items-center gap-1">
                    <CloudRain className="h-4 w-4" />
                    {worldState.weather}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Viewers:</span>
                <span className="font-bold">{worldState.viewerCount}</span>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-rows-[1fr_400px] gap-4 flex-1 overflow-hidden">
            {/* Top section with map and status */}
            <div className="grid grid-cols-2 gap-4">
              {/* Map */}
              <div className="bg-gray-800 rounded-lg p-4 h-[500px]">
                <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
                  {/* Keep existing map elements */}
                  {/* Background elements */}
                  <div className="absolute inset-0">
                    <div className="absolute left-1/4 right-1/4 top-1/2 h-0.5 bg-gray-700" />
                    <div className="absolute top-1/4 bottom-1/4 left-1/2 w-0.5 bg-gray-700" />
                    <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-green-900/30 rounded-full" />
                    <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-green-900/30 rounded-full" />
                  </div>

                  {/* Location markers */}
                  {Object.entries(locations).map(([key, location]) => (
                    <MapLocation
                      key={key}
                      icon={location.icon}
                      x={location.x}
                      y={location.y}
                      label={location.label}
                      isActive={currentLocation === key}
                      onClick={() => moveTruman(key)}
                    />
                  ))}

                  {/* Truman indicator */}
                  <TrumanIndicator x={trumanPosition.x} y={trumanPosition.y} />
                </div>
              </div>

              {/* Status and quick controls */}
              <div className="space-y-4">
                {/* Truman status */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src="/truman.png"
                        alt="Truman"
                        className="h-10 w-10"
                      />
                      <h2 className="font-bold">{truman.name}</h2>
                    </div>
                    <div className="text-sm">
                      Suspicion: {truman.suspicionLevel}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-400">Activity:</span>
                      <div className="mt-1 bg-gray-900 px-3 py-1.5 rounded">
                        {truman.currentActivity}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Mood:</span>
                      <div className="mt-1 bg-gray-900 px-3 py-1.5 rounded">
                        {truman.currentMood}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suspicion meter */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Suspicion Level</span>
                    <span>{worldState.suspicionMeter}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        worldState.suspicionMeter > 70
                          ? "bg-red-500"
                          : worldState.suspicionMeter > 40
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${worldState.suspicionMeter}%` }}
                    />
                  </div>
                </div>

                {/* Current Event */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Current Event
                  </div>
                  <div className="bg-gray-900 px-3 py-2 rounded h-[150px] overflow-y-auto">
                    {worldState.currentEvent || "No active event"}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section with agent controls */}
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col min-h-0 mt-0">
              {/* Agent selection tabs */}
              <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                {actors.map((actor) => (
                  <button
                    key={actor.name}
                    onClick={() => setSelectedActor(actor)}
                    className={`px-3 py-1.5 rounded ${
                      selectedActor?.name === actor.name
                        ? "bg-blue-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {/* <img
                      src={
                        actor.name === "Marlon"
                          ? "marlon.png"
                          : actor.name === "Meryl"
                          ? "meryl.png"
                          : ""
                      }
                      alt={actor.name}
                      className="h-6 w-6 mr-2"
                    /> */}
                    {actor.name}
                  </button>
                ))}
              </div>

              {selectedActor ? (
                <>
                  {/* Chat messages - now properly scrollable */}
                  <div className="flex-1 overflow-y-auto mb-4 min-h-0">
                    <div className="space-y-2 p-2">
                      {conversation.map((msg, i) => (
                        <div key={i} className="mb-2">
                          <div
                            className={`flex gap-2 ${
                              msg.type === "response"
                                ? "text-green-400"
                                : "text-blue-400"
                            }`}
                          >
                            <span className="font-bold">{msg.from}:</span>
                            <span className="text-white">{msg.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Input area */}
                  <div className="flex gap-2 flex-shrink-0">
                    <input
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleInstruction()
                      }
                      placeholder={`Direct ${selectedActor.name}...`}
                      className="flex-1 bg-gray-700 border-none rounded px-3 py-2"
                    />
                    <button
                      onClick={handleInstruction}
                      className="px-3 py-2 bg-blue-500 rounded"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select an actor to direct them
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Chat and Betting */}
        <div className="border-l border-gray-800 grid grid-rows-[1fr_auto] h-full overflow-hidden">
          {/* Global chat */}
          <div className="flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-bold">Live Chat</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.from === "User" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded px-3 py-2 ${
                      msg.from === "User" ? "bg-blue-500" : "bg-gray-800"
                    }`}
                  >
                    <div className="text-xs text-gray-400 mb-1">{msg.from}</div>
                    <div>{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Chat input */}
            <div className="p-4 border-t border-gray-800">
              <input
                type="text"
                placeholder="Send a message..."
                className="w-full bg-gray-800 rounded px-3 py-2"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleSendMessageToWorldAi(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          {/* Active bets - now with fixed height and scrollable */}
          <div className="border-t border-gray-800 h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-bold">Active Bets</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {bets.map((bet) => (
                  <div key={bet.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="font-medium mb-2">{bet.question}</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {bet.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => placeBet(bet.id, option)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          {option} ({bet.odds[option]}x)
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-400 flex justify-between">
                      <span>Pool: {bet.pool}</span>
                      <span>{bet.endTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
