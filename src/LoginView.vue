<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = 'Email ou mot de passe incorrect.'
    loading.value = false
  } else {
    // Redirection vers le tableau de bord admin en cas de succès
    router.push('/admin')
  }
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#F7F8FC] flex items-center justify-center p-6 text-slate-800">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span class="text-[#172B4D] text-3xl font-black">L</span>
        </div>
        <h1 class="text-2xl font-extrabold text-[#172B4D]">Administration</h1>
        <p class="text-slate-500 text-xs mt-1">École Ali – Connexion requise</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-bold mb-2 text-[#172B4D]">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="admin@ecole-ali.com"
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium"
          />
        </div>

        <div>
          <label class="block text-sm font-bold mb-2 text-[#172B4D]">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium"
          />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-xs font-semibold text-center">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#172B4D] font-bold transition text-sm shadow-sm cursor-pointer disabled:opacity-50"
        >
          {{ loading.value ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>

      <div class="mt-8 text-center">
        <RouterLink to="/" class="text-xs text-slate-400 hover:text-[#172B4D] font-semibold transition">
          ← Retour au site public
        </RouterLink>
      </div>
    </div>
  </div>
</template>