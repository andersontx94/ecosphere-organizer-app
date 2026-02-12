import { supabase } from "@/lib/supabase";

export type ConvertProposalOptions = {
  create_invoice?: boolean;
  create_process?: boolean;
  process_type_id?: string;
  agency?: string;
};

export type ConvertProposalResult = {
  client_id: string;
  enterprise_id: string;
  invoice_id: string | null;
  process_id: string | null;
};

export async function convertProposalToClient(
  proposalId: string,
  options: ConvertProposalOptions
) {
  const { data, error } = await supabase.rpc("convert_proposal", {
    proposal_id: proposalId,
    options,
  });

  if (error) {
    throw error;
  }

  return data as ConvertProposalResult;
}
