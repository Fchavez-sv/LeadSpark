import { supabase } from '../lib/supabaseClient'

export async function listLeadNotes(leadId) {
  const { data, error } = await supabase
    .from('lead_notes')
    .select('id, lead_id, author_id, note, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createLeadNote({ leadId, authorId, note }) {
  const { data, error } = await supabase
    .from('lead_notes')
    .insert([
      {
        lead_id: leadId,
        author_id: authorId,
        note: note.trim(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}
