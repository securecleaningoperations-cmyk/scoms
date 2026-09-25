import { describe, it, expect } from "vitest";
import { jevJudgePhoneCall, jevJudgeLead, jevJudgeDocument, jevJudgeOperations } from "@/lib/typesafe";

describe("TypeSafe Jev AI Engine", () => {
  it("should classify emergency biohazard phone call with Priority 1 escalation", async () => {
    const result = await jevJudgePhoneCall({
      transcript: "We have an active chemical solvent spill in Cleanroom Lab 3. Need certified HAZMAT crew right away!",
      fromNumber: "(512) 555-8910",
    });

    expect(result.isEmergency).toBe(true);
    expect(result.departmentRoute).toBe("emergency_dispatch");
    expect(result.urgencyRating).toBe(4);
    expect(result.sentiment).toBe("urgent");
    expect(result.recommendedAction).toContain("HAZMAT");
  });

  it("should qualify commercial sales leads and recommend Platinum tier for cleanroom labs", async () => {
    const result = await jevJudgeLead({
      companyName: "BioHealth Diagnostics",
      facilityType: "Cleanroom / Laboratory",
      squareFootage: 40000,
    });

    expect(result.recommendedPackage).toBe("platinum");
    expect(result.leadQualityScore).toBeGreaterThanOrEqual(3);
    expect(result.requiresSecurityClearance).toBe(true);
    expect(result.aiProfitPrediction.estimatedMonthlyRevenue).toBeGreaterThan(0);
  });

  it("should audit documents and assign legal retention and unaltered original requirement", async () => {
    const result = await jevJudgeDocument({
      name: "2025_Corporate_Tax_Filing_Form_1120.pdf",
    });

    expect(result.category).toBe("financial");
    expect(result.retentionScheduleYears).toBe(7);
    expect(result.preserveOriginalUnaltered).toBe(true);
    expect(result.brandedCoverSheetRequired).toBe(true);
  });

  it("should flag underbid jobs and calculate healthy operations crew sizing", async () => {
    const result = await jevJudgeOperations({
      jobTitle: "Commercial Campus Daily Cleaning",
      cleanableSqft: 60000,
      crewAssignedCount: 1,
      estimatedLaborCost: 4800,
      estimatedRevenue: 5000, // <10% margin -> underbid
      scheduledTime: new Date().toISOString(),
    });

    expect(result.underbidFlag).toBe(true);
    expect(result.requiresDirectorApproval).toBe(true);
    expect(result.recommendedCrewCount).toBeGreaterThan(1);
    expect(result.laborEfficiencyAlert).toBeDefined();
  });
});
