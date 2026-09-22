export const NUDGE_MESSAGES = ["路边好像还留了点什么…", "你确定都探索完了吗？"];

export function buildTrayState(clues, collectedIds) {
  return clues.map((c) => ({ id: c.id, icon: c.icon, collected: collectedIds.includes(c.id) }));
}

export function pickNudgeMessage(callCount) {
  return NUDGE_MESSAGES[callCount % NUDGE_MESSAGES.length];
}
