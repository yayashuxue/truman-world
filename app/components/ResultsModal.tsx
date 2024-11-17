// components/ResultsModal.tsx
import React from "react";

interface ResultsModalProps {
  results: Array<{ id: string; success: boolean; message: string }>;
  onClose: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ results, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-4 rounded shadow-lg w-1/3">
        <h2 className="text-lg font-bold mb-4">Bet Results</h2>
        <ul className="space-y-2">
          {results.map((result) => (
            <li
              key={result.id}
              className={`p-2 rounded ${
                result.success ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {result.message}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;
