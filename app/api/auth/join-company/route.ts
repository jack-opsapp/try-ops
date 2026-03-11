/**
 * POST /api/auth/join-company
 *
 * Associates a Firebase-authenticated user with a company via crew code.
 * - Verifies Firebase ID token
 * - Looks up company by external_id
 * - Updates user's company_id
 * - Auto-assigns role from pending team_invitation, or falls back to Unassigned
 *
 * Body: { idToken, companyCode }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/admin-verify";
import { getServiceRoleClient } from "@/lib/supabase/server-client";

const PRESET_UNASSIGNED_ROLE_ID = "00000000-0000-0000-0000-000000000006";

interface JoinCompanyBody {
  idToken: string;
  companyCode: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as JoinCompanyBody;
    const { idToken, companyCode } = body;

    if (!idToken || !companyCode) {
      return NextResponse.json(
        { error: "Missing required fields: idToken, companyCode" },
        { status: 400 }
      );
    }

    const firebaseUser = await verifyFirebaseToken(idToken);
    const db = getServiceRoleClient();

    // Find company by external_id
    const { data: company } = await db
      .from("companies")
      .select("id, name, logo_url, external_id")
      .eq("external_id", companyCode.trim().toUpperCase())
      .is("deleted_at", null)
      .maybeSingle();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found. Check the code and try again." },
        { status: 404 }
      );
    }

    // Find user by auth_id or firebase_uid
    const { data: user } = await db
      .from("users")
      .select("id, email, phone")
      .or(
        `auth_id.eq.${firebaseUser.uid},firebase_uid.eq.${firebaseUser.uid}`
      )
      .is("deleted_at", null)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    // Update user's company_id
    const { error: updateError } = await db
      .from("users")
      .update({
        company_id: company.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to join company: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Check for pending invitation to auto-assign role
    let roleAssigned = false;

    if (user.email) {
      const { data: invite } = await db
        .from("team_invitations")
        .select("id, role_id")
        .eq("company_id", company.id)
        .eq("email", user.email)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (invite) {
        // Mark invitation accepted
        await db
          .from("team_invitations")
          .update({
            status: "accepted",
            updated_at: new Date().toISOString(),
          })
          .eq("id", invite.id);

        if (invite.role_id) {
          await db.from("user_roles").upsert(
            {
              user_id: user.id,
              role_id: invite.role_id,
              assigned_at: new Date().toISOString(),
              assigned_by: null,
            },
            { onConflict: "user_id" }
          );
          roleAssigned = true;
        }
      }
    }

    // Fall back to Unassigned role
    if (!roleAssigned) {
      const { data: existingRole } = await db
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingRole) {
        await db.from("user_roles").upsert(
          {
            user_id: user.id,
            role_id: PRESET_UNASSIGNED_ROLE_ID,
            assigned_at: new Date().toISOString(),
            assigned_by: null,
          },
          { onConflict: "user_id" }
        );
      }
    }

    return NextResponse.json({
      success: true,
      companyId: company.id,
      companyName: company.name,
    });
  } catch (error) {
    console.error("[api/auth/join-company] Error:", error);

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
