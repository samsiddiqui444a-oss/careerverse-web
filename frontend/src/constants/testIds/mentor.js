// data-testid registry for the AI Career Mentor page
export const MENTOR = {
    page: "mentor-page",
    authGate: "mentor-auth-gate",
    sidebar: "mentor-sidebar",
    newSession: "mentor-new-session",
    sessionItem: (id) => `mentor-session-${id}`,
    sessionDelete: (id) => `mentor-session-delete-${id}`,
    emptyState: "mentor-empty",
    threadContainer: "mentor-thread",
    messageItem: (id) => `mentor-message-${id}`,
    streamingBubble: "mentor-streaming-bubble",
    composer: "mentor-composer",
    composerInput: "mentor-composer-input",
    composerSend: "mentor-composer-send",
    error: "mentor-error",
    suggestionChip: (i) => `mentor-suggestion-${i}`,
};
