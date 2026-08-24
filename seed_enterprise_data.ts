import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE credentials. Make sure to run with dotenv or --env-file=.env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function seedEnterpriseData() {
  console.log("🚀 Starting SCOMS v6.1 Enterprise Database Seeding...");

  // 1. Get or Create Tenant
  let { data: tenants } = await supabaseAdmin.from('tenants').select('*').limit(1);
  let tenantId = tenants && tenants.length > 0 ? tenants[0].id : null;
  if (!tenantId) {
    console.log("No tenant found. Creating default Corporate HQ Tenant...");
    const { data: newTenant, error: tenantErr } = await supabaseAdmin.from('tenants').insert([{
      name: "SCOMS Corporate HQ",
      type: "corporate",
      status: "active"
    }]).select().single();
    if (tenantErr) throw new Error(`Failed to create tenant: ${tenantErr.message}`);
    tenantId = newTenant.id;
  }
  console.log(`✅ Using Tenant ID: ${tenantId}`);

  // 2. Get Employees and Users
  let { data: employees } = await supabaseAdmin.from('employees').select('*');
  let { data: users } = await supabaseAdmin.from('users').select('*');

  // If no employees, create dummy employee
  let firstEmpId = employees && employees.length > 0 ? employees[0].id : null;
  let firstUserId = users && users.length > 0 ? users[0].id : null;
  let empName = employees && employees.length > 0 ? `${employees[0].first_name || 'David'} ${employees[0].last_name || 'Miller'}` : "David Miller";

  // 3. Seed Clients
  console.log("📦 Seeding Clients...");
  const clientSeed = [
    { tenant_id: tenantId, client_id: "CLI-001", name: "Metro Health Medical Center", address: "1000 Medical Park Blvd, Phoenix AZ", phone: "(602) 555-0101", email: "facilities@metrohealth.org", rating: 5, type: "Healthcare", properties_count: 4, status: "Active" },
    { tenant_id: tenantId, client_id: "CLI-002", name: "First National Bank Tower", address: "400 N Financial Way, Phoenix AZ", phone: "(602) 555-0102", email: "ops@fnb-tower.com", rating: 5, type: "Commercial", properties_count: 2, status: "Active" },
    { tenant_id: tenantId, client_id: "CLI-003", name: "Logistics Hub Alpha", address: "8800 Industrial Pkwy, Tempe AZ", phone: "(480) 555-0103", email: "warehouse@logistics-alpha.com", rating: 4, type: "Industrial", properties_count: 3, status: "Active" },
    { tenant_id: tenantId, client_id: "CLI-004", name: "Apex High School District", address: "2300 Education Ave, Scottsdale AZ", phone: "(480) 555-0104", email: "maint@apexdistrict.edu", rating: 5, type: "Educational", properties_count: 6, status: "Active" },
    { tenant_id: tenantId, client_id: "CLI-005", name: "Skyline Corporate Plaza", address: "550 Skyline Dr, Phoenix AZ", phone: "(602) 555-0105", email: "management@skylineplaza.com", rating: 4, type: "Commercial", properties_count: 1, status: "Active" }
  ];
  const { data: clients, error: clientErr } = await supabaseAdmin.from('clients').upsert(clientSeed, { onConflict: 'email', ignoreDuplicates: true }).select();
  if (clientErr) console.error("Client seed error:", clientErr.message);
  let dbClients = (await supabaseAdmin.from('clients').select('*')).data || [];
  console.log(`✅ Clients ready (${dbClients.length} rows)`);

  // 4. Seed Jobs & Schedules
  console.log("📦 Seeding Jobs & Checklists...");
  const today = new Date().toISOString().split('T')[0];
  const jobSeed = [
    { tenant_id: tenantId, client: "Metro Health Medical Center", client_id: dbClients[0]?.id, service: "Nightly Terminal Sanitation & Biohazard Scrub", status: "In Progress", assigned: empName, job_date: today, type: "Recurring", crew_size: 4, time: "22:00 - 05:00", estimated_cost: 850.00, actual_cost: 820.00, estimated_revenue: 1650.00, profit_margin: 48.5 },
    { tenant_id: tenantId, client: "First National Bank Tower", client_id: dbClients[1]?.id, service: "Executive Floor & Lobby Deep Polish", status: "Approved", assigned: empName, job_date: today, type: "Recurring", crew_size: 2, time: "18:00 - 22:00", estimated_cost: 400.00, actual_cost: 380.00, estimated_revenue: 850.00, profit_margin: 52.9 },
    { tenant_id: tenantId, client: "Logistics Hub Alpha", client_id: dbClients[2]?.id, service: "Warehouse Floor Scrubbing & Degreasing", status: "Created", assigned: empName, job_date: today, type: "One-Time", crew_size: 3, time: "06:00 - 14:00", estimated_cost: 1100.00, actual_cost: 1050.00, estimated_revenue: 2200.00, profit_margin: 50.0 },
    { tenant_id: tenantId, client: "Apex High School District", client_id: dbClients[3]?.id, service: "Campus Restroom Disinfection & Refill", status: "Accepted", assigned: empName, job_date: today, type: "Recurring", crew_size: 5, time: "15:30 - 23:30", estimated_cost: 1250.00, actual_cost: 1200.00, estimated_revenue: 2400.00, profit_margin: 47.9 },
    { tenant_id: tenantId, client: "Skyline Corporate Plaza", client_id: dbClients[4]?.id, service: "Exterior Glass & High-Reach Windows", status: "Closed", assigned: empName, job_date: today, type: "Specialized", crew_size: 2, time: "07:00 - 15:00", estimated_cost: 600.00, actual_cost: 580.00, estimated_revenue: 1400.00, profit_margin: 57.1 }
  ];
  let { data: insertedJobs, error: jobErr } = await supabaseAdmin.from('jobs').insert(jobSeed).select();
  if (jobErr) console.error("Job seed error:", jobErr.message);
  let dbJobs = (await supabaseAdmin.from('jobs').select('*')).data || [];
  console.log(`✅ Jobs ready (${dbJobs.length} rows)`);

  // Seed Checklists for first 3 jobs
  if (dbJobs.length > 0 && firstEmpId) {
    const checklistSeed = [];
    for (let i = 0; i < Math.min(dbJobs.length, 3); i++) {
      checklistSeed.push(
        { tenant_id: tenantId, job_id: dbJobs[i].id, task_name: "Sanitize and wipe down all high-touch surfaces", is_completed: true, completed_by: firstEmpId, order_index: 1 },
        { tenant_id: tenantId, job_id: dbJobs[i].id, task_name: "Empty all recycling and hazardous waste bins", is_completed: true, completed_by: firstEmpId, order_index: 2 },
        { tenant_id: tenantId, job_id: dbJobs[i].id, task_name: "Restock restroom soap, paper towels, and sanitizer", is_completed: false, completed_by: null, order_index: 3 },
        { tenant_id: tenantId, job_id: dbJobs[i].id, task_name: "Supervisor QA signature and photo confirmation", is_completed: false, completed_by: null, order_index: 4 }
      );
    }
    await supabaseAdmin.from('job_checklists').insert(checklistSeed);
  }

  // Seed Schedules
  if (dbJobs.length > 0) {
    const scheduleSeed = dbJobs.map(j => ({
      tenant_id: tenantId,
      job_id: j.id,
      employee_id: firstEmpId,
      scheduled_start: new Date(Date.now() + 3600000).toISOString(),
      scheduled_end: new Date(Date.now() + 18000000).toISOString(),
      status: "scheduled",
      notes: `Dispatch schedule for ${j.service}`
    }));
    await supabaseAdmin.from('schedules').insert(scheduleSeed);
  }

  // 5. Seed Invoices & Ledger
  console.log("📦 Seeding Invoices & Financials...");
  const invoiceSeed = [
    { tenant_id: tenantId, invoice_id: "INV-2026-001", client: "Metro Health Medical Center", amount: 14500.00, issue_date: "2026-07-01", due_date: "2026-07-31", status: "paid" },
    { tenant_id: tenantId, invoice_id: "INV-2026-002", client: "First National Bank Tower", amount: 8200.00, issue_date: "2026-07-05", due_date: "2026-08-05", status: "pending" },
    { tenant_id: tenantId, invoice_id: "INV-2026-003", client: "Logistics Hub Alpha", amount: 22000.00, issue_date: "2026-06-15", due_date: "2026-07-15", status: "overdue" },
    { tenant_id: tenantId, invoice_id: "INV-2026-004", client: "Apex High School District", amount: 18400.00, issue_date: "2026-07-10", due_date: "2026-08-10", status: "pending" },
    { tenant_id: tenantId, invoice_id: "INV-2026-005", client: "Skyline Corporate Plaza", amount: 6500.00, issue_date: "2026-06-01", due_date: "2026-06-30", status: "paid" }
  ];
  await supabaseAdmin.from('invoices').insert(invoiceSeed);

  // Check if ledger has revenue, if not add some
  let { count: ledgerCount } = await supabaseAdmin.from('ledger').select('*', { count: 'exact', head: true });
  if (!ledgerCount || ledgerCount < 5) {
    const ledgerSeed = [
      { tenant_id: tenantId, type: "Revenue", amount: 48500.00, description: "July Commercial Cleaning Contracts", account_code: "REV-4001", recorded_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      { tenant_id: tenantId, type: "Revenue", amount: 52000.00, description: "June Healthcare Sanitation Services", account_code: "REV-4001", recorded_at: new Date(Date.now() - 86400000 * 35).toISOString() },
      { tenant_id: tenantId, type: "Revenue", amount: 45000.00, description: "May Industrial Maintenance Revenue", account_code: "REV-4001", recorded_at: new Date(Date.now() - 86400000 * 65).toISOString() },
      { tenant_id: tenantId, type: "Expense", amount: 18500.00, description: "Bi-Weekly Workforce Payroll Run", account_code: "EXP-5001", recorded_at: new Date(Date.now() - 86400000 * 7).toISOString() },
      { tenant_id: tenantId, type: "Expense", amount: 6200.00, description: "Eco-Friendly Cleaning Supply Restock", account_code: "EXP-5002", recorded_at: new Date(Date.now() - 86400000 * 10).toISOString() },
      { tenant_id: tenantId, type: "Liability", amount: 12400.00, description: "Accrued Employee Payroll Liability", account_code: "LIA-2001", recorded_at: new Date().toISOString() }
    ];
    await supabaseAdmin.from('ledger').insert(ledgerSeed);
  }

  // 6. Seed Assets
  console.log("📦 Seeding Assets...");
  const assetSeed = [
    { tenant_id: tenantId, asset_code: "AST-01", name: "Honda Accord 2023 - Fleet #01", type: "vehicle", status: "active", purchase_date: "2023-03-15", purchase_cost: 28500.00, current_value: 22000.00, useful_life_years: 5, location: "Phoenix HQ Parking" },
    { tenant_id: tenantId, asset_code: "AST-02", name: "Tennant T7 Micro-Rider Floor Scrubber", type: "equipment", status: "active", purchase_date: "2024-01-10", purchase_cost: 14200.00, current_value: 12500.00, useful_life_years: 7, location: "Logistics Hub Alpha Warehouse" },
    { tenant_id: tenantId, asset_code: "AST-03", name: "Pressure Washer Pro 4000 PSI", type: "machinery", status: "maintenance", purchase_date: "2023-11-20", purchase_cost: 3800.00, current_value: 3100.00, useful_life_years: 4, location: "Tempe Service Depot" },
    { tenant_id: tenantId, asset_code: "AST-04", name: "MacBook Pro M3 16-inch - OPS Manager", type: "technology", status: "active", purchase_date: "2024-02-01", purchase_cost: 2800.00, current_value: 2400.00, useful_life_years: 3, location: "Corporate Office" },
    { tenant_id: tenantId, asset_code: "AST-05", name: "Ford Transit Cargo Van 2024", type: "vehicle", status: "active", purchase_date: "2024-05-12", purchase_cost: 45000.00, current_value: 41000.00, useful_life_years: 6, location: "Scottsdale Route Fleet" }
  ];
  await supabaseAdmin.from('assets').insert(assetSeed);

  // 7. Seed Quality Audits & Inspections
  console.log("📦 Seeding Quality Audits & CAPA...");
  const auditSeed = [
    { tenant_id: tenantId, audit_id: "AUD-2026-88", type: "Terminal Clean Compliance", location: "Metro Health Medical Center", auditor: "Sarah Jenkins (QA Director)", audit_date: today, score: 96, status: "Passed", findings: 1 },
    { tenant_id: tenantId, audit_id: "AUD-2026-89", type: "Executive Floor Safety Audit", location: "First National Bank Tower", auditor: "Marcus Vance (Ops QA)", audit_date: today, score: 98, status: "Passed", findings: 0 },
    { tenant_id: tenantId, audit_id: "AUD-2026-90", type: "Chemical Storage & OSHA Inspection", location: "Logistics Hub Alpha", auditor: "Sarah Jenkins (QA Director)", audit_date: today, score: 84, status: "Action Required", findings: 3 },
    { tenant_id: tenantId, audit_id: "AUD-2026-91", type: "Restroom Hygiene Sanitation Check", location: "Apex High School District", auditor: "David Miller (Supervisor)", audit_date: today, score: 92, status: "Passed", findings: 2 }
  ];
  await supabaseAdmin.from('audits').insert(auditSeed);

  if (dbJobs.length > 0) {
    const inspectionSeed = [
      { tenant_id: tenantId, job_id: dbJobs[0].id, client_id: dbJobs[0].client_id, inspector_id: firstEmpId, score: 96, status: "passed", checklist: [{ item: "Biohazard waste sealed", passed: true }, { item: "UV surface disinfection", passed: true }], notes: "Exemplary sanitation protocols followed." },
      { tenant_id: tenantId, job_id: dbJobs[1].id, client_id: dbJobs[1].client_id, inspector_id: firstEmpId, score: 82, status: "needs_action", checklist: [{ item: "Lobby marble polish streak-free", passed: false }, { item: "Elevator brass fixtures sanitization", passed: true }], notes: "Minor streaking observed near north entrance revolving doors." }
    ];
    let { data: insData } = await supabaseAdmin.from('qa_inspections').insert(inspectionSeed).select();
    
    if (insData && insData.length > 0) {
      await supabaseAdmin.from('capa_actions').insert([
        { tenant_id: tenantId, inspection_id: insData[1].id, title: "Re-buff lobby marble entrance floors", description: "Use microfiber buffing pads with neutral stone cleaner to remove streaks.", assigned_to: firstUserId, due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], status: "in_progress", root_cause: "Improper dilution ratio of cleaning solution used during night shift.", corrective_action: "Recalibrated chemical dispenser and re-buffed entrance.", preventive_action: "Updated staff chemical mixing cheat sheet." }
      ]);
    }
  }

  // 8. Seed Tax Reports & Profit Analysis
  console.log("📦 Seeding Tax Reports & Profit AI...");
  await supabaseAdmin.from('tax_reports').insert([
    { tenant_id: tenantId, report_type: "quarterly_filing", period_start: "2026-04-01", period_end: "2026-06-30", total_income: 145500.00, total_deductions: 56900.00, tax_liability: 18606.00, status: "filed" },
    { tenant_id: tenantId, report_type: "quarterly_filing", period_start: "2026-01-01", period_end: "2026-03-31", total_income: 138200.00, total_deductions: 52400.00, tax_liability: 17998.00, status: "filed" },
    { tenant_id: tenantId, report_type: "monthly_summary", period_start: "2026-07-01", period_end: "2026-07-31", total_income: 48500.00, total_deductions: 18500.00, tax_liability: 6300.00, status: "draft" }
  ]);

  if (dbJobs.length > 0) {
    const profitSeed = dbJobs.map((j, i) => ({
      tenant_id: tenantId,
      job_id: j.id,
      estimated_labor_cost: Number(j.estimated_cost) * 0.7,
      estimated_supply_cost: Number(j.estimated_cost) * 0.2,
      estimated_fuel_cost: Number(j.estimated_cost) * 0.1,
      estimated_time_hours: 6.5,
      estimated_revenue: Number(j.estimated_revenue),
      estimated_profit: Number(j.estimated_revenue) - Number(j.estimated_cost),
      risk_score: i % 2 === 0 ? "low" : "medium",
      recommendation: "accept",
      actual_labor_cost: Number(j.actual_cost || j.estimated_cost) * 0.7,
      actual_supply_cost: Number(j.actual_cost || j.estimated_cost) * 0.2,
      actual_revenue: Number(j.estimated_revenue),
      actual_profit: Number(j.estimated_revenue) - Number(j.actual_cost || j.estimated_cost),
      efficiency_score: 94.5 + i,
      analysis_stage: "post_job"
    }));
    await supabaseAdmin.from('job_profit_analysis').insert(profitSeed);
  }

  // 9. Seed Documents, Communications, Customer Receptionist
  console.log("📦 Seeding Documents, Comms & Receptionist...");
  await supabaseAdmin.from('documents').insert([
    { tenant_id: tenantId, name: "Master Service Agreement - Metro Health", category: "client", subcategory: "Contracts", file_path: "/docs/msa_metro_health.pdf", version: 2, status: "signed", is_original: true },
    { tenant_id: tenantId, name: "OSHA Chemical Handling Protocol 2026", category: "operations", subcategory: "Safety", file_path: "/docs/osha_chemical_2026.pdf", version: 4, status: "active", is_original: true },
    { tenant_id: tenantId, name: "Employee Handbook & Code of Conduct", category: "employee", subcategory: "HR Policy", file_path: "/docs/employee_handbook.pdf", version: 3, status: "active", is_original: true }
  ]);

  await supabaseAdmin.from('customer_inquiries').insert([
    { tenant_id: tenantId, source: "phone", customer_name: "Dr. Aris Thorne", customer_email: "athorne@bio-labs.org", customer_phone: "(602) 555-0199", inquiry_type: "Commercial Clean Quote", message: "Need nightly ISO-9 bio-cleanroom sanitation quote for 15,000 sq ft facility in Scottsdale.", ai_response: "Thank you Dr. Thorne. Our AI receptionist has categorized your facility as specialized bio-cleanroom. A senior account executive has been dispatched with preliminary pricing of $0.18/sq ft.", status: "contacted" },
    { tenant_id: tenantId, source: "web", customer_name: "Elena Rostova", customer_email: "elena@tech-campus.com", customer_phone: "(480) 555-0188", inquiry_type: "Window Washing RFP", message: "Requesting proposal for quarterly exterior glass cleaning on 4-story commercial tech office building.", ai_response: "Hello Elena, we have received your RFP for exterior window maintenance. Our specialized high-reach crew team will review building schematics within 2 business hours.", status: "new" }
  ]);

  await supabaseAdmin.from('customer_reviews').insert([
    { tenant_id: tenantId, client_id: dbClients[0]?.id, rating: 5, review_text: "SCOMS hospital-grade sanitation team is unmatched. 100% compliance on all JCAHO infection control standards.", platform: "Google Business", response_text: "Thank you Metro Health! Our team is dedicated to rigorous clinical hygiene." },
    { tenant_id: tenantId, client_id: dbClients[1]?.id, rating: 5, review_text: "The lobby marble shines like glass every morning. Excellent supervisory oversight and responsive management.", platform: "TrustPilot", response_text: "We appreciate your partnership First National Bank Tower!" }
  ]);

  await supabaseAdmin.from('communications').insert([
    { tenant_id: tenantId, type: "zoom", entity_type: "client", title: "Quarterly Performance & SLA Review - Metro Health", notes: "Reviewing infection control scorecards and Q3 pricing adjustments.", zoom_join_url: "https://zoom.us/j/9876543210?pwd=enterprise", status: "scheduled", scheduled_at: new Date(Date.now() + 86400000).toISOString() },
    { tenant_id: tenantId, type: "call", entity_type: "lead", title: "Preliminary Scope Walkthrough - Bio Labs Scottsdale", notes: "Discussing ISO-9 cleanroom certification requirements with Dr. Thorne.", status: "completed", scheduled_at: new Date(Date.now() - 3600000 * 4).toISOString() }
  ]);

  console.log("🎉 SCOMS v6.1 Enterprise Database Seeding Completed Successfully!");
}

seedEnterpriseData().catch(err => {
  console.error("Fatal Seeding Error:", err);
  process.exit(1);
});
