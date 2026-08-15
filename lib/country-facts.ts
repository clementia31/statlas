import { supabase } from './supabase';

export async function getCountryExtras(entityId: string) {
  const { data: facts, error: factsError } = await supabase
    .from('country_facts')
    .select('*')
    .eq('entity_id', entityId)
    .maybeSingle();

  if (factsError) {
    console.error('Erreur country_facts:', factsError.message);
  }

  let currencyName: string | null = null;
  if (facts?.currency_code) {
    const { data: curr } = await supabase
      .from('currencies')
      .select('name')
      .eq('code', facts.currency_code)
      .maybeSingle();
    currencyName = curr?.name ?? null;
  }

  const { data: membershipRows, error: memError } = await supabase
    .from('entity_groups')
    .select('group_id')
    .eq('entity_id', entityId);

  if (memError) {
    console.error('Erreur entity_groups:', memError.message);
  }

  let memberships: { name_default: string; slug: string }[] = [];
  if (membershipRows && membershipRows.length > 0) {
    const groupIds = membershipRows.map((r) => r.group_id);
    const { data: groups } = await supabase
      .from('groups')
      .select('name_default, slug')
      .in('id', groupIds);
    memberships = groups ?? [];
  }

  return { facts, currencyName, memberships };
}
