import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RETENTION_MONTHS, type WexReferralData } from "@/schema/wex-referral";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  let query = supabase
    .from("wex_referrals")
    .select("id, created_at, confirmed_at, source, reviewed, extracted_json")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `extracted_json->>student_name.ilike.%${q}%,extracted_json->>school.ilike.%${q}%,extracted_json->>referral_number.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { extracted_json, source } = body as {
    extracted_json: WexReferralData;
    source: "scan" | "digital";
  };

  if (!extracted_json || !source) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const deleteAfter = new Date();
  deleteAfter.setMonth(deleteAfter.getMonth() + RETENTION_MONTHS);

  const { data, error } = await supabase
    .from("wex_referrals")
    .insert({
      created_by: user.id,
      confirmed_at: new Date().toISOString(),
      source,
      reviewed: true,
      extracted_json,
      delete_after: deleteAfter.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
