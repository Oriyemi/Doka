import "server-only";
import { db } from "@/lib/db";

const STEP_MIN = 30; // start times offered every 30 minutes
const TZ = "+01:00"; // Nigeria (WAT) has no daylight saving

// date is "YYYY-MM-DD" in Nigerian time. Returns free start times as ISO strings.
export async function getFreeSlots(
  storeId: string,
  date: string,
  durationMin: number,
) {
  const weekday = new Date(`${date}T12:00:00${TZ}`).getUTCDay();

  const { rows: win } = await db.query(
    `SELECT to_char(start_time,'HH24:MI') AS s, to_char(end_time,'HH24:MI') AS e
     FROM availability WHERE store_id = $1 AND weekday = $2`,
    [storeId, weekday],
  );
  if (!win[0]) return []; // provider doesn't work this day

  const dayStart = new Date(`${date}T${win[0].s}:00${TZ}`);
  const dayEnd = new Date(`${date}T${win[0].e}:00${TZ}`);

  const { rows: taken } = await db.query(
    `SELECT start_at, end_at FROM booking
     WHERE store_id = $1 AND status IN ('pending','accepted')
       AND start_at < $3 AND end_at > $2`,
    [storeId, dayStart, dayEnd],
  );

  const slots: string[] = [];
  const len = durationMin * 60_000;
  for (
    let t = dayStart.getTime();
    t + len <= dayEnd.getTime();
    t += STEP_MIN * 60_000
  ) {
    const clash = taken.some(
      (b) =>
        new Date(b.start_at).getTime() < t + len &&
        new Date(b.end_at).getTime() > t,
    );
    if (!clash && t > Date.now()) slots.push(new Date(t).toISOString());
  }
  return slots;
}