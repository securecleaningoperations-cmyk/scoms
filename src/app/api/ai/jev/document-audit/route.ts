import { NextRequest, NextResponse } from "next/server";
import { jevJudgeDocument } from "@/lib/typesafe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, snippet, sourceFileExtension } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing 'name' in request" }, { status: 400 });
    }

    const result = await jevJudgeDocument({
      name,
      category,
      snippet,
      sourceFileExtension,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Jev Document Audit API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
