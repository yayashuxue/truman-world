import React from "react";

// Placeholder UI components
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded shadow ${className}`}>{children}</div>
);

export const CardHeader = ({ children }) => (
  <div className="border-b p-4">{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export const Button = ({
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

export const Input = ({ className = "", ...props }) => (
  <input
    className={`border rounded px-3 py-2 focus:outline-none focus:ring ${className}`}
    {...props}
  />
);

// Custom icons
export const Briefcase = () => (
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

export const Coffee = () => (
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

export const Store = () => (
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

export const Tree = () => (
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

export const MapLocation = ({ icon: Icon, x, y, label, isActive, onClick }) => {
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

export const TrumanIndicator = ({ x, y }) => {
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

export function calculateSuspicionIncrease(responseText) {
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

export const StatusBadge = ({ children, className = "" }) => (
  <div className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}>
    {children}
  </div>
);

export interface WorldState {
  weather: string;
  timeOfDay: string;
  currentEvent: string | null;
  suspicionMeter: number;
  viewerCount: string;
}

export interface ChatMessage {
  from: string;
  text: string;
}

export const parseConversationText = (text: string) => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => {
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