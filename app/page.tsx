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
        <div className="p-2 rounded-full bg-red-500 text-white animate-pulse">
          <User className="h-6 w-6" />
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

export default function TrumanWorldApp() {
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
    weather: 'Sunny',
    timeOfDay: 'Morning',
    currentEvent: null,
    suspicionMeter: 20,
    viewerCount: '1.2M',
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
      const response = await fetch('/api/world-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldState, recentEvents }),
      });
      console.log("World AI response", response);
      if (!response.ok) {
        throw new Error('Failed to fetch World AI response');
      }

      const data = await response.json();

      if (data.changes) {
        setWorldState(prev => ({
          ...prev,
          ...data.changes,
          currentEvent: data.event,
        }));
      }

      setRecentEvents(prev => [...prev, data.event]);
    } catch (error) {
      console.error('Error triggering World AI:', error);
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
    console.log("Generating new bet ... ");
    // Call the World AI to generate a new bet
    try {
      const response = await fetch("/api/world-ai-bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldState, recentEvents }),
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
    }, 10000); // Every 10 seconds (adjust as needed)

    return () => clearInterval(interval);
  }, [worldState, recentEvents]);

  
  const [selectedActor, setSelectedActor] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [conversation, setConversation] = useState([]);
  const [agentConversations, setAgentConversations] = useState<{
    [key: string]: Array<{ from: string; text: string }>;
  }>({});

  // Function to get agent's response to user instruction
  const getAgentResponse = async (agentName: string, userInstruction: string) => {
    try {
      const agentHistory = agentConversations[agentName] || [];

      const response = await fetch('/api/agent-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, userInstruction, agentHistory }),
      });

      if (!response.ok) throw new Error('Failed to fetch agent response');

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching agent response:', error);
      return "I'm not sure what you mean.";
    }
  };

  // Function for Truman's autonomous movement
  const trumanDecideNextAction = async () => {
    try {
      const response = await fetch('/api/truman-next-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspicionLevel: worldState.suspicionMeter,
          conversationHistory: conversation,
          currentLocation,
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch Truman\'s next action');

      const data = await response.json();
      if (locations[data.nextAction]) {
        moveTruman(data.nextAction);
      }
    } catch (error) {
      console.error('Error determining Truman\'s next action:', error);
    }
  };

  // Function for autonomous agent actions
  const agentAutonomousActions = async () => {
    for (const agent of actors) {
      // 30% chance for each agent to interact
      if (Math.random() > 0.3) continue;

      try {
        const response = await fetch('/api/agent-autonomous-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName: agent.name,
            agentHistory: agentConversations[agent.name] || [],
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch agent autonomous message');

        const data = await response.json();
        const agentMessage = data.response;

        // Update agent's conversation history
        setAgentConversations((prev) => ({
          ...prev,
          [agent.name]: [
            ...(prev[agent.name] || []),
            { from: agent.name, text: agentMessage },
          ],
        }));

        // Add to main conversation
        const actorAction = {
          type: 'action',
          from: agent.name,
          text: agentMessage,
        };

        setConversation((prev) => [...prev, actorAction]);

        // Get Truman's response
        const trumanResponse = await getTrumanResponse(agent.name, agentMessage);
        
        const newInteraction = {
          type: 'response',
          from: 'Truman',
          text: trumanResponse.text,
          suspicionIncrease: trumanResponse.suspicionIncrease,
        };

        setConversation((prev) => [...prev, newInteraction]);

      } catch (error) {
        console.error('Error in autonomous agent action:', error);
      }
    }
  };

  // Simulate Truman's movement
  const moveTruman = (targetLocation) => {
    const target = locations[targetLocation];
    setCurrentLocation(targetLocation);

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
    const agentResponse = await getAgentResponse(selectedActor.name, instruction);

    // Update agent's conversation history
    setAgentConversations((prev) => ({
      ...prev,
      [selectedActor.name]: [
        ...(prev[selectedActor.name] || []),
        { from: 'User', text: instruction },
        { from: selectedActor.name, text: agentResponse },
      ],
    }));

    // Show agent's action in the conversation
    const actorAction = {
      type: 'action',
      from: selectedActor.name,
      text: agentResponse,
    };

    setConversation((prev) => [...prev, actorAction]);
    setInstruction('');

    // Get Truman's response
    const trumanResponse = await getTrumanResponse(selectedActor.name, agentResponse);

    const newInteraction = {
      type: 'response',
      from: 'Truman',
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Show Status */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-red-500 animate-pulse" />
              The Truman Show - Live
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-600">Viewers</div>
                <div className="text-xl mt-1">{worldState.viewerCount}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-600">Weather</div>
                <div className="text-xl mt-1 flex items-center gap-2">
                  <CloudRain className="h-5 w-5" />
                  {worldState.weather}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-600">Time</div>
                <div className="text-xl mt-1 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {worldState.timeOfDay}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-600">Current Event</div>
                <div className="text-xl mt-1">{worldState.currentEvent}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-600">Suspicion Meter</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
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
            </div>
          </CardContent>
        </Card>

        {/* Add the Global Chat Card here */}
        <Card>
          <CardHeader>
            <CardTitle>Global Chat with World AI</CardTitle>
          </CardHeader>
          <CardContent>
            <GlobalChat messages={chatMessages} onSendMessage={handleSendMessageToWorldAi} />
          </CardContent>
        </Card>

        {/* Truman Status */}
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {truman.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-medium text-gray-600">Current Activity</div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge className="bg-blue-100 text-blue-800">
                    {truman.currentActivity}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Mood</div>
                <div className="mt-1">{truman.currentMood}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Suspicion Level</div>
                <div className="mt-1">{truman.suspicionLevel}</div>
              </div>
            </div>
            {/* Add next destination indicator */}
            <div className="mt-4 border-t pt-4">
              <div className="font-medium text-gray-600">Next Destination</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="animate-pulse">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-blue-600">
                  Moving to: {locations[currentLocation]?.label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-red-500" />
              Seahaven Island
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video bg-blue-50 rounded-lg overflow-hidden">
              {/* Background map elements */}
              <div className="absolute inset-0 p-4">
                {/* Roads */}
                <div className="absolute left-1/4 right-1/4 top-1/2 h-1 bg-gray-300" />
                <div className="absolute top-1/4 bottom-1/4 left-1/2 w-1 bg-gray-300" />

                {/* Water */}
                <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-blue-200 opacity-50" />

                {/* Green spaces */}
                <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-50" />
                <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-green-200 rounded-full opacity-50" />
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

              {/* Truman's position */}
              <TrumanIndicator x={trumanPosition.x} y={trumanPosition.y} />
            </div>

            {/* Quick navigation */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {Object.entries(locations).map(([key, location]) => (
                <Button
                  key={key}
                  variant={currentLocation === key ? "default" : "outline"}
                  onClick={() => moveTruman(key)}
                  className="flex items-center gap-2"
                >
                  <location.icon className="h-4 w-4" />
                  <span>{location.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Actors and Direction */}
          <div className="space-y-6">
            {/* Actors Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Cast Members</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {actors.map((actor) => (
                  <div
                    key={actor.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedActor?.name === actor.name
                        ? "border-blue-500 shadow-lg"
                        : ""
                    }`}
                    onClick={() => setSelectedActor(actor)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{actor.name}</h3>
                        <p className="text-sm text-gray-600">{actor.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Trust Level</div>
                        <div
                          className={`font-bold ${
                            actor.trustLevel > 90
                              ? "text-green-600"
                              : actor.trustLevel > 70
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {actor.trustLevel}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Current: {actor.currentActivity}</div>
                      <div>Agenda: {actor.agenda}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Director Controls */}
            {selectedActor && (
              <Card>
                <CardHeader>
                  <CardTitle>Direct {selectedActor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-y-auto mb-4 border rounded-lg p-4 space-y-2">
                    {conversation.map((msg, i) => (
                      <div key={i} className="mb-3">
                        {msg.type === "instruction" && (
                          <div className="flex justify-end">
                            <div className="bg-blue-100 text-blue-800 rounded-lg p-2 text-sm">
                              {msg.text}
                            </div>
                          </div>
                        )}
                        {msg.type === "action" && (
                          <div className="flex justify-start">
                            <div className="bg-green-100 text-green-800 rounded-lg p-2 text-sm">
                              {msg.text}
                            </div>
                          </div>
                        )}
                        {msg.type === "response" && (
                          <div className="space-y-1">
                            <div className="flex justify-start">
                              <div className="bg-gray-100 rounded-lg p-2 text-sm">
                                <strong>Truman:</strong> {msg.text}
                              </div>
                            </div>
                            {msg.suspicionIncrease > 0 && (
                              <div className="flex items-center gap-1 text-yellow-600 text-xs">
                                <AlertTriangle className="h-4 w-4" />
                                Suspicion increased by {msg.suspicionIncrease}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleInstruction()
                      }
                      placeholder={`Tell ${selectedActor.name} what to say to Truman...`}
                      className="flex-1"
                    />
                    <Button onClick={handleInstruction}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Betting and Events */}
          <div className="space-y-6">
            {/* Active Bets */}
            <Card>
              <CardHeader>
                <CardTitle>Active Bets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bets.map((bet) => (
                    <div key={bet.id} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">{bet.question}</div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {bet.options.map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            onClick={() => placeBet(bet.id, option)}
                            className="w-full"
                          >
                            {option} ({bet.odds[option]}x)
                          </Button>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>Pool: {bet.pool}</span>
                        <span>Ends in: {bet.endTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Discoveries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Discoveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {truman.recentDiscoveries.length === 0 ? (
                    <p className="text-gray-500 italic">
                      No recent suspicious activities
                    </p>
                  ) : (
                    truman.recentDiscoveries.map((discovery, i) => (
                      <div
                        key={i}
                        className="p-2 bg-red-50 text-red-700 rounded"
                      >
                        {discovery}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
