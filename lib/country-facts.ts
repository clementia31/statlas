import { supabase } from './supabase';

export async function getCountryExtras(entityId: string) {
  const { data: facts } = await supabase
    .from('country_facts')
    .select('*, currencies(name)')
    .eq('entity_id', entityId)
    .maybeSingle();

  const { data: membershipRows } = await supabase
    .from('entity_groups')
    .select('groups(name_default, slug)')
    .eq('entity_id', entityId);

  const memberships = (membershipRows ?? [])
    .map((r: any) => r.groups)
    .filter(Boolean);

  return { facts, memberships };
}
