import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "~/server/auth";

export async function GET(
    _request: NextRequest) {
    const session = await getSessionFromRequest();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ session });
}
