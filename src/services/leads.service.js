import { supabase } from '../lib/supabaseClient'

export async function createLead(payload) {
  const record = {
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone ?? null,
    company: payload.company ?? null,
    source: payload.source,
    privacy_consent: true,
    consented_at: new Date().toISOString(),
    status: 'nuevo',
  }

  const { data, error } = await supabase.from('leads').insert([record]).select().single()

  if (error) throw error
  return data
}

export async function listLeads({ status, search } = {}) {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`
    query = query.or(
      `full_name.ilike.${term},email.ilike.${term},company.ilike.${term},phone.ilike.${term}`,
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function updateLeadStatus(leadId, status) {
  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)
    .select()
    .single()

  if (error) throw error
  return data
}
