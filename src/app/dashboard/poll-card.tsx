'use client';

import { useState } from 'react';
import { castVote, getUserVoteOptionId, getStoredPolls } from '@/lib/local-data';

interface PollCardProps {
  poll: any;
}

export default function PollCard({ poll }: PollCardProps) {
  const [hasVoted, setHasVoted] = useState(() => getUserVoteOptionId(poll.id));
  const [currentPoll, setCurrentPoll] = useState(poll);

  const totalVotes = currentPoll.options.reduce((s: number, o: any) => s + o.vote_count, 0);

  const handleVote = (optionId: string) => {
    castVote(poll.id, optionId);
    setHasVoted(optionId);
    const updated = getStoredPolls().find((p: any) => p.id === poll.id);
    if (updated) setCurrentPoll(updated);
  };

  return (
    <div className="border border-amber-100 rounded-lg p-4 hover:border-amber-200 transition-colors">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{currentPoll.question}</h3>
      <div className="space-y-2 mb-3">
        {currentPoll.options.map((opt: any) => {
          const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
          const isSelected = hasVoted === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              className="w-full text-left relative group"
            >
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-200 bg-gray-50 hover:border-amber-200 hover:bg-amber-50/50'
              }`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300 group-hover:border-amber-400'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-xs text-gray-700 flex-1">{opt.text}</span>
                <span className="text-xs font-medium text-gray-500">{pct}%</span>
              </div>
              {totalVotes > 0 && (
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden mx-3 mt-1">
                  <div className="h-full bg-amber-300 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-1 pt-2 border-t border-gray-100">
        <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        {hasVoted && <span className="text-amber-600 font-medium">✓ Voted</span>}
      </div>
    </div>
  );
}