import {
  activityFilters,
  type ActivityFilter,
  type ActivityPeriod,
} from "@/data/activity";
import { getActivityPage } from "@/lib/activity";
import { createClient } from "@/lib/supabase/server";

const periods = new Set<ActivityPeriod>(["7", "30", "90", "all"]);
export async function GET(request: Request) {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const requestedFilter = params.get("filter") ?? "all";
  const filter: ActivityFilter = activityFilters.includes(
    requestedFilter as ActivityFilter,
  )
    ? (requestedFilter as ActivityFilter)
    : "all";
  const requestedPeriod = params.get("period") ?? "30";
  const period: ActivityPeriod = periods.has(requestedPeriod as ActivityPeriod)
    ? (requestedPeriod as ActivityPeriod)
    : "30";
  const offset = Math.max(
    0,
    Math.min(Number.parseInt(params.get("offset") ?? "0", 10) || 0, 10_000),
  );
  try {
    return Response.json(
      await getActivityPage(client, user.id, filter, period, offset),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Unable to load activity:", error);
    return Response.json(
      { message: "We couldn't load your activity." },
      { status: 500 },
    );
  }
}
