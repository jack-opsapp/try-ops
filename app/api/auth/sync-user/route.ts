/**
 * POST /api/auth/sync-user
 *
 * Syncs a Firebase-authenticated user with the Supabase users table.
 * - Verifies Firebase ID token via jose JWKS
 * - Looks up user by firebase_uid/auth_id or email
 * - Creates new user record if none exists
 * - Returns { user, company, isNewUser }
 *
 * Body: { idToken, email, displayName?, firstName?, lastName?, photoURL? }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/admin-verify";
import { getServiceRoleClient } from "@/lib/supabase/server-client";

interface SyncUserBody {
  idToken: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SyncUserBody;
    const { idToken, email, displayName, firstName, lastName, photoURL } = body;

    if (!idToken || !email) {
      return NextResponse.json(
        { error: "Missing required fields: idToken, email" },
        { status: 400 }
      );
    }

    const firebaseUser = await verifyFirebaseToken(idToken);
    const firebaseUid = firebaseUser.uid;

    const db = getServiceRoleClient();

    // Look up existing user by auth_id, firebase_uid, then email
    const { data: byAuthId } = await db
      .from("users")
      .select("*")
      .eq("auth_id", firebaseUid)
      .is("deleted_at", null)
      .maybeSingle();

    let existingRow = byAuthId;

    if (!existingRow) {
      const { data: byFirebaseUid } = await db
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .is("deleted_at", null)
        .maybeSingle();
      existingRow = byFirebaseUid;
    }

    if (!existingRow) {
      const { data: byEmail } = await db
        .from("users")
        .select("*")
        .eq("email", email)
        .is("deleted_at", null)
        .maybeSingle();
      existingRow = byEmail;
    }

    // ── Existing user: update auth fields ──
    if (existingRow) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (!existingRow.auth_id) updates.auth_id = firebaseUid;
      if (!existingRow.firebase_uid) updates.firebase_uid = firebaseUid;
      if (photoURL && !existingRow.profile_image_url) updates.profile_image_url = photoURL;
      if (firstName && !existingRow.first_name) updates.first_name = firstName;
      if (lastName && !existingRow.last_name) updates.last_name = lastName;

      await db.from("users").update(updates).eq("id", existingRow.id);

      // Fetch company if linked
      let company = null;
      if (existingRow.company_id) {
        const { data: companyRow } = await db
          .from("companies")
          .select("id, name, industries, company_size, company_age")
          .eq("id", existingRow.company_id)
          .is("deleted_at", null)
          .single();
        company = companyRow;
      }

      return NextResponse.json({
        user: {
          id: existingRow.id,
          firstName: existingRow.first_name || firstName || "",
          lastName: existingRow.last_name || lastName || "",
          email: existingRow.email,
          companyId: existingRow.company_id,
          hasCompletedOnboarding: existingRow.has_completed_onboarding ?? false,
        },
        company,
        isNewUser: false,
      });
    }

    // ── New user: create record ──
    const derivedFirst = firstName || displayName?.split(" ")[0] || "";
    const derivedLast = lastName || displayName?.split(" ").slice(1).join(" ") || "";

    const newRow = {
      auth_id: firebaseUid,
      firebase_uid: firebaseUid,
      email,
      first_name: derivedFirst,
      last_name: derivedLast,
      profile_image_url: photoURL ?? null,
      role: "Field Crew",
      is_active: true,
      is_company_admin: true,
      has_completed_onboarding: false,
      has_completed_tutorial: false,
      dev_permission: false,
    };

    const { data: inserted, error: insertError } = await db
      .from("users")
      .insert(newRow)
      .select("*")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: `Failed to create user: ${insertError?.message ?? "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: inserted.id,
        firstName: derivedFirst,
        lastName: derivedLast,
        email,
        companyId: null,
        hasCompletedOnboarding: false,
      },
      company: null,
      isNewUser: true,
    });
  } catch (error) {
    console.error("[api/auth/sync-user] Error:", error);

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
