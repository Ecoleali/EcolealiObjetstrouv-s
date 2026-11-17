<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from './lib/supabase' // ou './lib/supabase' selon votre structure

const route = useRoute()
const router = useRouter()
const objectId = route.params.id

const objectDetails = ref(null)
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref(false)

const form = ref({
  parentName: '',
  email: '',
  phone: '',
  childName: '',
  childClass: '',
  message: ''
})

async function fetchObjectDetails() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('objects')
      .select('*')
      .eq('id', objectId)
      .single()

    if (error) {
      errorMessage.value = "Impossible de récupérer les détails de cet objet."
    } else {
      objectDetails.value = data
    }
  } catch (err) {
    errorMessage.value = "Erreur de connexion au serveur."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchObjectDetails()
})

async function submitClaim(e) {
  e.preventDefault()
  submitting.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase
      .from('claims')
      .insert([
        {
          object_id: objectId,
          parent_name: form.value.parentName,
          email: form.value.email,
          phone: form.value.phone,
          child_name: form.value.childName,
          child_class: form.value.childClass,
          message: form.value.message,
          status: 'En attente'
        }
      ])

    if (error) {
      errorMessage.value = error.message || "Erreur lors de l'enregistrement."
    } else {
      successMessage.value = true
    }
  } catch (err) {
    errorMessage.value = "Une erreur est survenue."
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#F7F8FC] text-slate-800 flex flex-col">

    <!-- HEADER (Padding réduit ou supprimé : py-4 au lieu de py-6, px-4 au lieu de px-8) -->
    <header class="bg-[#172B4D] text-white shadow-md">
      <nav class="w-full mx-auto px-4 py-4 flex items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center">
            <span class="text-[#172B4D] text-2xl font-black">L</span>
          </div>
          <div>
            <h1 class="text-xl font-bold">
              Lost <span class="text-amber-400">&</span> Found
            </h1>
            <p class="text-[10px] text-slate-300 tracking-widest mt-0.5">
              ÉCOLE ALI
            </p>
          </div>
        </div>

        <RouterLink
          to="/"
          class="inline-flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition duration-300"
        >
          ← Retour
        </RouterLink>
      </nav>
    </header>

    <!-- MAIN CONTENT (Suppression des px-6 et py-12 pour enlever les marges intérieures) -->
    <main class="w-full flex-1 flex items-center justify-center p-0">

      <!-- CHARGEMENT -->
      <div v-if="loading" class="text-center py-20 text-slate-500 font-medium">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#172B4D] border-t-transparent mb-4"></div>
        <p>Chargement des informations...</p>
      </div>

      <!-- ERREUR -->
      <div v-else-if="errorMessage && !objectDetails" class="w-full p-6 bg-red-50 border border-red-200 text-red-600 text-center font-bold">
        {{ errorMessage }}
      </div>

      <!-- FORMULAIRE (Vous pouvez aussi enlever rounded-3xl si vous voulez qu'il colle aux bords) -->
      <div v-else class="w-full max-w-4xl bg-white shadow-sm p-6 md:p-10">
        
        <!-- MESSAGE DE SUCCÈS -->
        <div v-if="successMessage" class="text-center py-12 space-y-4">
          <div class="text-6xl">🎉</div>
          <h2 class="text-3xl font-extrabold text-[#172B4D]">Réclamation envoyée !</h2>
          <p class="text-slate-600 max-w-md mx-auto">
            L'administration de l'école Ali a bien reçu votre demande.
          </p>
          <div class="pt-6">
            <RouterLink
              to="/"
              class="inline-block px-8 py-4 bg-[#172B4D] text-amber-400 font-bold rounded-xl shadow-md hover:bg-[#111f38] transition"
            >
              Retourner à l'accueil
            </RouterLink>
          </div>
        </div>

        <!-- FORMULAIRE ACTIF -->
        <div v-else>
          <div class="mb-8 text-center">
            <span class="bg-[#172B4D]/10 text-[#172B4D] text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Formulaire de réclamation
            </span>
            <h2 class="text-3xl font-black text-[#172B4D] mt-3">
              C'est votre objet ?
            </h2>
            <p class="text-slate-500 mt-2 text-sm">
              Remplissez ce formulaire pour prouver qu'il appartient à votre enfant.
            </p>
          </div>

          <!-- RAPPEL DE L'OBJET -->
          <div v-if="objectDetails" class="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <div class="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img v-if="objectDetails.image" :src="objectDetails.image" :alt="objectDetails.name" class="w-full h-full object-cover" />
              <span v-else class="text-2xl">📦</span>
            </div>
            <div>
              <h3 class="text-lg font-extrabold text-[#172B4D]">{{ objectDetails.name }}</h3>
              <p class="text-xs text-slate-500 mt-1" v-if="objectDetails.location">📍 Lieu : {{ objectDetails.location }}</p>
              <p class="text-xs text-slate-500" v-if="objectDetails.date">📅 Date : {{ objectDetails.date }}</p>
            </div>
          </div>

          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold">
            {{ errorMessage }}
          </div>

          <!-- FORM -->
          <form @submit="submitClaim" class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Votre Nom (Parent/Tuteur)</label>
                <input
                  v-model="form.parentName"
                  type="text"
                  required
                  placeholder="Ex: Mme Dupont"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#172B4D] font-medium text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Adresse E-mail</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="Ex: parent@email.com"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#172B4D] font-medium text-sm"
                />
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Numéro de téléphone</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="Ex: 000 000 0000"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#172B4D] font-medium text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nom de l'élève (Enfant)</label>
                <input
                  v-model="form.childName"
                  type="text"
                  required
                  placeholder="Ex: Lucas Dupont"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#172B4D] font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Classe de l'élève</label>
              <input
                v-model="form.childClass"
                type="text"
                required
                placeholder="Ex: 4e primaire Gr 2"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#172B4D] font-medium text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Précisions ou description</label>
              <textarea
                v-model="form.message"
                rows="3"
                placeholder="Ex: Il y a un porte-clé rouge..."
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#172B4D] font-medium text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3 bg-[#172B4D] hover:bg-[#111f38] text-amber-400 font-extrabold rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <span v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent"></span>
              <span>{{ submitting ? 'Envoi en cours...' : 'Envoyer ma réclamation' }}</span>
            </button>
          </form>
        </div>

      </div>

    </main>

    <!-- FOOTER (Padding réduit) -->
    <footer class="bg-[#172B4D] text-white mt-auto">
      <div class="w-full mx-auto px-4 py-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <p class="font-bold">Lost <span class="text-amber-400">&</span> Found – École Ali</p>
        <p class="text-slate-400 text-xs">© École Ali</p>
      </div>
    </footer>

  </div>
</template>