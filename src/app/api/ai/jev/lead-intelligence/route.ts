import { NextRequest, NextResponse } from "next/server";
import { jevJudgeLead } from "@/lib/typesafe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, facilityType, squareFootage, frequency, estimatedValue, notes } = body;

    if (!companyName) {
      return NextResponse.json({ error: "Missing 'companyName' in request" }, { status: 400 });
    }

    const result = await jevJudgeLead({
      companyName,
      facilityType,
      squareFootage: squareFootage ? Number(squareFootage) : undefined,
      frequency,
      estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Jev Lead Intelligence API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
