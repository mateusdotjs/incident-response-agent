export function createClock(anchor = new Date()) {
  return (minutesAgo: number) =>
    new Date(anchor.getTime() - minutesAgo * 60_000);
}

export type MinutesAgo = ReturnType<typeof createClock>;
