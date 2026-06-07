// GET /api/export?format=csv|json
// Export toàn bộ entries (vocab + patterns)

import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'

  const { data: entries, error } = await supabase
    .from('entries')
    .select('type, hanzi, pinyin, hv, meaning_vi, meaning_en, notes, source, created_at')
    .order('created_at')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (format === 'json') {
    return new Response(JSON.stringify(entries, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="chinesekit_export.json"',
      },
    })
  }

  // CSV
  const headers = ['type', 'hanzi', 'pinyin', 'hv', 'meaning_vi', 'meaning_en', 'notes', 'source', 'created_at']
  const escape  = (v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`
  const rows    = [
    headers.join(','),
    ...entries.map(e => headers.map(h => escape(e[h])).join(',')),
  ]

  return new Response(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="chinesekit_export.csv"',
    },
  })
}
