import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('URL présente :', !!supabaseUrl)
console.log('Clé présente :', !!supabaseKey)

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('objects')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Erreur Supabase :', error.message)
    return {
      success: false,
      message: error.message
    }
  }

  console.log('Connexion Supabase réussie !', data)

  return {
    success: true,
    message: 'Connexion à Supabase réussie !'
  }
}