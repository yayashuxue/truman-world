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
import { useGlobalContext } from './store/globalContext';

// Placeholder UI components, replace these with your actual UI components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded shadow ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => (
  <div className="border-b p-4">{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const Button = ({
  children,
  onClick,
  variant = "default",
  className = "",
  ...props
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded ${
      variant === "outline"
        ? "border border-gray-300 text-gray-700"
        : "bg-blue-500 text-white"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);
const Input = ({ className = "", ...props }) => (
  <input
    className={`border rounded px-3 py-2 focus:outline-none focus:ring ${className}`}
    {...props}
  />
);

// Custom icons to replace the unsupported ones
const Briefcase = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const Coffee = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
    <line x1="6" y1="2" x2="6" y2="4"></line>
    <line x1="10" y1="2" x2="10" y2="4"></line>
    <line x1="14" y1="2" x2="14" y2="4"></line>
  </svg>
);

const Store = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
    <path d="M12 12v5"></path>
  </svg>
);

const Tree = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18"></path>
    <path d="M8 6a4 4 0 0 1 8 0c0 2-2 3-4 4-2-1-4-2-4-4Z"></path>
    <path d="M8 12a4 4 0 0 1 8 0c0 2-2 3-4 4-2-1-4-2-4-4Z"></path>
  </svg>
);

const MapLocation = ({ icon: Icon, x, y, label, isActive, onClick }) => {
  return (
    <div
      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 
        ${isActive ? "scale-110" : "hover:scale-105"} transition-transform`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
    >
      <div
        className={`p-2 rounded-full ${
          isActive ? "bg-blue-500 text-white" : "bg-white shadow-md"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      {label && (
        <div className="mt-1 text-xs font-medium text-center whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
};

const TrumanIndicator = ({ x, y }) => {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative">
        <div className="p-2 rounded-full bg-trans text-white animate-pulse">
          <img src="/truman.png" className="h-6 w-6" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      </div>
      <div className="mt-1 text-xs font-bold text-center text-red-500">
        TRUMAN
      </div>
    </div>
  );
};
function calculateSuspicionIncrease(responseText) {
  let suspicionIncrease = 0;
  const lowerText = responseText.toLowerCase();

  if (
    lowerText.includes("suspicious") ||
    lowerText.includes("watched") ||
    lowerText.includes("strange") ||
    lowerText.includes("weird")
  ) {
    suspicionIncrease += 20;
  } else if (lowerText.includes("unusual") || lowerText.includes("odd")) {
    suspicionIncrease += 10;
  }

  return suspicionIncrease;
}

// Add this new component near other UI components at the top
const StatusBadge = ({ children, className = "" }) => (
  <div className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}>
    {children}
  </div>
);

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
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      // Try to extract speaker and message
      const match = line.match(/^(.*?):\s*(.*)$/);
      if (match) {
        return {
          speaker: match[1].trim(),
          message: match[2].trim()
        };
      }
      return null;
    })
    .filter(item => item !== null);
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

  const handleSendMessageToWorldAi = async (message) => {
    // Add the user's message to the chat
    setChatMessages((prev) => [...prev, { from: "User", text: message }]);

    // Fetch the World AI's response
    try {
      const response = await fetch("/api/world-ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, chatHistory: chatMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch World AI chat response");
      }

      const data = await response.json();

      // Add the World AI's response to the chat
      setChatMessages((prev) => [
        ...prev,
        { from: "World AI", text: data.response },
      ]);
    } catch (error) {
      console.error("Error communicating with World AI:", error);
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

  // Active bets
  const [bets, setBets] = useState([
    {
      id: 1,
      question: "Will Truman notice today's staged event?",
      options: ["Yes", "No"],
      endTime: "1 hour",
      pool: "1000 USDC",
      odds: { Yes: "3.5", No: "1.5" },
    },
    {
      id: 2,
      question: "Will Truman try to leave Seahaven today?",
      options: ["Yes", "No"],
      endTime: "24 hours",
      pool: "5000 USDC",
      odds: { Yes: "10.0", No: "1.1" },
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

        if (!response.ok) throw new Error("Failed to fetch agent autonomous message");

        const data = await response.json();
        const conversationParts = parseConversationText(data.response);

        // Add each part of the conversation separately
        for (const part of conversationParts) {
          const messageType = part.speaker === "Truman" ? "response" : "action";
          
          setConversation(prev => [...prev, {
            type: messageType,
            from: part.speaker,
            text: part.message,
            suspicionIncrease: messageType === "response" ? calculateSuspicionIncrease(part.message) : 0
          }]);

          // Update agent conversations
          setAgentConversations(prev => ({
            ...prev,
            [agent.name]: [
              ...(prev[agent.name] || []),
              { from: part.speaker, text: part.message }
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

  // Handle betting
  const placeBet = (betId, choice) => {
    // To be implemented with web3
    console.log(`Placing bet on ${betId}: ${choice}`);
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

  return (
    <div className="h-screen bg-gray-900 text-white">
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
          <div className="grid grid-rows-[1fr_500px] gap-4 flex-1 overflow-hidden">
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
                      <img src="/truman.png" alt="Truman" className="h-10 w-10" />
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
                          <div className={`flex gap-2 ${
                            msg.type === "response" ? "text-green-400" : "text-blue-400"
                          }`}>
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
