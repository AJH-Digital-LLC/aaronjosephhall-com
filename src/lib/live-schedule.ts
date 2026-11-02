const zone = "America/Chicago";
const formatter = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
function parts(now: number) {
  return Object.fromEntries(formatter.formatToParts(now).filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
}
function centralTen(year: number, month: number, day: number) {
  const wall = Date.UTC(year, month - 1, day, 10);
  let result = wall;
  for (let i = 0; i < 3; i++) {
    const p = parts(result);
    result += wall - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  }
  return result;
}
export function liveSchedule(now: number) {
  const p = parts(now);
  const localDate = new Date(Date.UTC(p.year, p.month - 1, p.day));
  const isSunday = localDate.getUTCDay() === 0;
  localDate.setUTCDate(localDate.getUTCDate() + (7 - localDate.getUTCDay()) % 7);
  let next = centralTen(localDate.getUTCFullYear(), localDate.getUTCMonth() + 1, localDate.getUTCDate());
  if (now >= next) {
    localDate.setUTCDate(localDate.getUTCDate() + 7);
    next = centralTen(localDate.getUTCFullYear(), localDate.getUTCMonth() + 1, localDate.getUTCDate());
  }
  const seconds = Math.max(0, Math.floor((next - now) / 1000));
  const countdown = `${Math.floor(seconds / 86400)}d ${Math.floor(seconds / 3600) % 24}h ${Math.floor(seconds / 60) % 60}m ${seconds % 60}s`;
  return { isSunday, afterStart: isSunday && p.hour >= 10, countdown, next };
}
