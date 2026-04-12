import React from 'react';
import { MdCheckCircle, MdPerson } from 'react-icons/md';
import './ParticipantsList.css';

const initialsFromLabel = (label = '') => {
  const parts = String(label).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const ParticipantsList = ({ participants, createdBy, currentUserEmail, onOpenProfile }) => {
  const normalizedCreatorEmail = (createdBy || '').toLowerCase();
  const normalizedCurrentUserEmail = (currentUserEmail || '').toLowerCase();

  // Sort participants: creator first, then others
  const sortedParticipants = [
    ...participants,
  ].sort((a, b) => {
      const emailA = (a.userEmail || a.email || '').toLowerCase();
      const emailB = (b.userEmail || b.email || '').toLowerCase();
      if (emailA === normalizedCreatorEmail) return -1;
      if (emailB === normalizedCreatorEmail) return 1;
      return 0;
    });

  return (
    <div className="participants-list">
      {sortedParticipants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No participants yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedParticipants.map((participant) => {
            const participantEmail = participant.userEmail || participant.email || '';
            const normalizedParticipantEmail = participantEmail.toLowerCase();
            const isCreator = normalizedParticipantEmail === normalizedCreatorEmail;
            const isCurrentUser = normalizedParticipantEmail === normalizedCurrentUserEmail;
            const displayName = participant.displayName || participantEmail;

            return (
              <div
                key={participant._id || participantEmail}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.(participantEmail)}
                    className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center text-xs font-semibold text-gray-600"
                    title={`View ${displayName} profile`}
                  >
                    {participant.profileImage ? (
                      <img src={participant.profileImage} alt={displayName} className="w-full h-full object-cover" />
                    ) : participant.displayName ? (
                      <span>{initialsFromLabel(displayName)}</span>
                    ) : (
                      <MdPerson size={20} className="text-gray-400" />
                    )}
                  </button>
                  {isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.(participantEmail)}
                    className="text-sm font-medium text-gray-900 truncate hover:text-orange-600 transition-colors"
                  >
                    {displayName}
                    {isCurrentUser && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                  </button>
                  <p className="text-xs text-gray-400 truncate">{participantEmail}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(participant.joinedAt).toLocaleDateString()}
                  </p>
                </div>

                {isCreator && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                    <MdCheckCircle size={14} className="text-orange-600" />
                    <span className="text-xs font-semibold text-orange-600">Host</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;
