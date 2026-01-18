// Supabase Edge Function for automatic budget updates
// Deploy with: supabase functions deploy update-budget

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transaction } = await req.json();

    // Only process expenses
    if (transaction.type !== 'Expense') {
      return new Response(
        JSON.stringify({ success: true, message: 'Not an expense, no budget update needed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract month from transaction date (YYYY-MM format)
    const month = transaction.date.slice(0, 7);

    // Find matching budget
    const { data: budget, error: budgetError } = await supabaseClient
      .from('budgets')
      .select('*')
      .eq('context_id', transaction.context_id)
      .eq('category', transaction.category)
      .eq('month', month)
      .single();

    if (budgetError) {
      // No budget found for this category/month - that's okay
      return new Response(
        JSON.stringify({ success: true, message: 'No budget found for this category' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update budget spent amount
    const newSpent = (budget.spent || 0) + transaction.amount;

    const { error: updateError } = await supabaseClient
      .from('budgets')
      .update({ spent: newSpent })
      .eq('id', budget.id);

    if (updateError) {
      throw updateError;
    }

    // Check if budget is exceeded
    if (newSpent > budget.monthly_limit) {
      return new Response(
        JSON.stringify({
          success: true,
          warning: {
            message: `Budget exceeded for ${transaction.category}!`,
            category: transaction.category,
            spent: newSpent,
            limit: budget.monthly_limit,
            exceeded_by: newSpent - budget.monthly_limit,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Budget updated successfully',
        spent: newSpent,
        limit: budget.monthly_limit,
        remaining: budget.monthly_limit - newSpent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
