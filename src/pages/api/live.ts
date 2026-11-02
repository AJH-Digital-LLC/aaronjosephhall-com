import type { APIRoute } from 'astro';
import { parseLiveStream, parseStreamArchive, selectBroadcast, unavailableStream, type LiveStream } from '@/lib/youtube-live';
export const prerender = false;
const channel = 'UCoNc4H8sog_x4hQKUL9p31A';
let cached: { expires: number; stream: LiveStream } | undefined;
let pending: Promise<LiveStream> | undefined;
let lastReplay: LiveStream = { status: 'replay', videoId: '7rZOPIsFa3Y', title: 'Staying Connected || Aaron Joseph Hall' };
async function youtubePage(path: string) {
  try {
    const response = await fetch(`https://www.youtube.com/channel/${channel}/${path}?hl=en`, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; AaronJosephHall/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? await response.text() : '';
  } catch { return ''; }
}
async function check() {
  const [live, archive] = await Promise.all([youtubePage('live'), youtubePage('streams')]);
  const current = live ? parseLiveStream(live, channel) : unavailableStream;
  const streams = parseStreamArchive(archive);
  const replay = streams.find(s => s.status === 'replay');
  if (replay) lastReplay = replay;
  const result = selectBroadcast(current, streams, lastReplay);
  cached = { stream: result, expires: Date.now() + 25_000 };
  return result;
}
export const GET: APIRoute = async () => {
  if (!cached || cached.expires < Date.now()) pending ??= check().finally(() => { pending = undefined; });
  const stream = pending ? await pending : cached!.stream;
  return new Response(JSON.stringify(stream), { headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=0, s-maxage=25',
  } });
};
