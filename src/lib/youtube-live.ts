export type LiveStream = { status: "live" | "replay" | "upcoming" | "offline" | "unavailable"; videoId: string | null; title: string; };
export const unavailableStream: LiveStream = { status: "unavailable", videoId: null, title: "" };

/** Parse only the channel's own player response, never unrelated recommended videos. */
export function parseLiveStream(html: string, channelId: string, now = Date.now()): LiveStream {
  const marker = /(?:var\s+)?ytInitialPlayerResponse\s*=\s*/.exec(html);
  if (!marker) return html.includes('"externalId":"' + channelId + '"')
    ? { status: "offline", videoId: null, title: "" } : unavailableStream;
  const start = marker.index + marker[0].length;
  let depth = 0, quoted = false, escaped = false, end = -1;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) return unavailableStream;
  try {
    const p = JSON.parse(html.slice(start, end));
    const v = p.videoDetails;
    if (v?.channelId !== channelId || !/^[\w-]{11}$/.test(v?.videoId || "")) return unavailableStream;
    const broadcast = p.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;
    const active = (v.isLive === true || broadcast?.isLiveNow === true) && !broadcast?.endTimestamp && p.playabilityStatus?.status === "OK";
    if (active) return { status: "live", videoId: v.videoId, title: v.title || "Jubilee City Church Live" };
    const scheduled = Number(p.playabilityStatus?.liveStreamability?.liveStreamabilityRenderer?.offlineSlate?.liveStreamOfflineSlateRenderer?.scheduledStartTime) * 1000;
    if (v.isUpcoming && Number.isFinite(scheduled) && scheduled > now - 12 * 3600_000) {
      return { status: "upcoming", videoId: v.videoId, title: v.title || "Upcoming service" };
    }
    if (v.isLiveContent && !v.isUpcoming && p.playabilityStatus?.status === "OK") return { status: "replay", videoId: v.videoId, title: v.title || "Latest service replay" };
    if (v.isLiveContent || p.playabilityStatus?.status === "OK") return { status: "offline", videoId: null, title: "" };
    return unavailableStream;
  } catch { return unavailableStream; }
}

/** Only inspect videos in the selected channel Streams tab, in newest-first order. */
export function parseStreamArchive(html: string): LiveStream[] {
  const match = html.match(/(?:var ytInitialData\s*=\s*|window\["ytInitialData"\]\s*=\s*)(\{.*?\});?\s*<\/script>/s);
  if (!match) return [];
  try {
    const data = JSON.parse(match[1]);
    const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const selected = tabs.find((tab: any) => tab.tabRenderer?.selected)?.tabRenderer;
    if (!selected || !/live|streams/i.test(selected.title || "")) return [];
    const results: LiveStream[] = [];
    const visit = (node: any): void => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) { node.forEach(visit); return; }
      const modern = node.lockupViewModel;
      const legacy = node.videoRenderer;
      if (modern || legacy) {
        const id = modern?.contentId || legacy?.videoId;
        const metadata = modern?.metadata?.lockupMetadataViewModel;
        const title = metadata?.title?.content || legacy?.title?.runs?.map((r: any) => r.text).join("") || legacy?.title?.simpleText;
        const labels = JSON.stringify(modern ? [metadata?.metadata, modern.contentImage?.thumbnailViewModel?.overlays?.filter((o: any) => o.thumbnailBottomOverlayViewModel)] : [legacy.badges, legacy.thumbnailOverlays, legacy.publishedTimeText]);
        const live = /"text":"LIVE"|BADGE_STYLE_TYPE_LIVE_NOW|THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE|"style":"LIVE"/.test(labels);
        const replay = /Streamed |streamed |Streamed live /i.test(labels);
        if (/^[\w-]{11}$/.test(id || "") && title && (live || replay) && !legacy?.upcomingEventData) {
          results.push({ status: live ? "live" : "replay", videoId: id, title });
        }
        return;
      }
      Object.values(node).forEach(visit);
    };
    visit(selected.content);
    return results;
  } catch { return []; }
}

export function selectBroadcast(current: LiveStream, archive: LiveStream[], fallback: LiveStream): LiveStream {
  if (current.status === "live") return current;
  return archive.find(item => item.status === "live")
    || archive.find(item => item.status === "replay")
    || (current.status === "replay" ? current : fallback);
}
