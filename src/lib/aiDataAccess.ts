import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a server-side client with admin privileges
// DANGER: We must explicitly enforce Tenant ID filters on every query!
const getAdminClient = () => createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export interface AIContextOptions {
  tenantId: string;
  startDate?: string;
  endDate?: string;
}

/**
 * AI Data Access Architecture
 * 
 * Provides safe, read-only context boundaries for LLMs.
 * Prevents hallucinations by returning raw ledger/job data.
 * All functions strictly require `tenantId` to enforce multi-tenant isolation.
 */
export const AIDataAccess = {

  /**
   * Retrieves high-level profitability metrics for the AI CFO.
   */
  async getProfitabilityContext(options: AIContextOptions) {
    const supabase = getAdminClient();
    const { tenantId, startDate, endDate } = options;
    
    let query = supabase.from('ledger').select('type, amount, category').eq('tenant_id', tenantId);
    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);

    const { data: ledger, error } = await query;
    if (error) throw new Error(`Failed to fetch ledger context: ${error.message}`);

    let revenue = 0;
    let expenses = 0;
    let categories: Record<string, number> = {};

    ledger?.forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        revenue += amount;
      } else {
        expenses += amount;
        categories[tx.category] = (categories[tx.category] || 0) + amount;
      }
    });

    return {
      total_revenue: revenue,
      total_expenses: expenses,
      net_profit: revenue - expenses,
      margin_percentage: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
      expense_breakdown: categories
    };
  },

  /**
   * Retrieves operational incident context for the AI Compliance Auditor.
   */
  async getComplianceContext(options: AIContextOptions) {
    const supabase = getAdminClient();
    const { tenantId, startDate, endDate } = options;

    let query = supabase.from('incidents').select('id, type, severity, status').eq('tenant_id', tenantId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: incidents, error } = await query;
    if (error) throw new Error(`Failed to fetch compliance context: ${error.message}`);

    const stats = {
      total: incidents?.length || 0,
      open: 0,
      critical: 0,
      by_type: {} as Record<string, number>
    };

    incidents?.forEach(inc => {
      if (inc.status !== 'closed') stats.open++;
      if (inc.severity === 'critical') stats.critical++;
      stats.by_type[inc.type] = (stats.by_type[inc.type] || 0) + 1;
    });

    return stats;
  },

  /**
   * Generates a comprehensive natural language summary of the business state.
   */
  async getSystemPromptContext(tenantId: string) {
    const profitContext = await this.getProfitabilityContext({ tenantId });
    const complianceContext = await this.getComplianceContext({ tenantId });
    
    return `
      System Context:
      You are the SCOMS Enterprise AI Assistant. 
      The current tenant's financial health shows a net profit of $${profitContext.net_profit.toFixed(2)} 
      with a margin of ${profitContext.margin_percentage.toFixed(1)}%.
      There are ${complianceContext.open} open operational incidents (${complianceContext.critical} critical).
      Answer all queries strictly based on this context. Do not invent financial numbers.
    `;
  }
};
