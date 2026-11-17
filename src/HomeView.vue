<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'

const router = useRouter()

const categories = ['Toutes', 'Sacs', 'Vêtements', 'Fournitures', 'Autres']
const selectedCategory = ref('Toutes')
const search = ref('')
const objects = ref([])
const loading = ref(true)
const fetchError = ref('')

// Charger les objets depuis la table Supabase "objects"
async function fetchObjects() {
  loading.value = true
  fetchError.value = ''

  try {
    const { data, error } = await supabase
      .from('objects')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Erreur Supabase :', error)
      fetchError.value = error.message
    } else {
      objects.value = data || []
    }
  } catch (err) {
    console.error('Erreur inattendue :', err)
    fetchError.value = 'Impossible de contacter le serveur.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchObjects()
})

// Filtrer les objets par recherche textuelle et par catégorie sélectionnée
const filteredObjects = computed(() => {
  const query = search.value.toLowerCase().trim()

  return objects.value.filter(object => {
    const name = object.name ? object.name.toLowerCase() : ''
    const location = object.location ? object.location.toLowerCase() : ''
    const description = object.description ? object.description.toLowerCase() : ''

    const matchesSearch = !query || name.includes(query) || location.includes(query) || description.includes(query)
    const matchesCategory = selectedCategory.value === 'Toutes' || object.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

// Rediriger vers le formulaire de réclamation avec l'ID de l'objet
function claimObject(objectId) {
  router.push(`/claim/${objectId}`)
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#F7F8FC] text-slate-800 flex flex-col">

    <!-- HEADER -->
    <header class="bg-[#172B4D] text-white shadow-md">
      <nav class="max-w-[1800px] mx-auto px-8 xl:px-20 py-6 flex items-center justify-between gap-6">

        <div class="flex items-center gap-4">
          <div class="w-14 h-14  rounded-2xl flex items-center justify-center">
            <img src="../src/img/LOGO.png" alt="">
          </div>
          <div>
            <h1 class="text-2xl font-bold">
              Objets perdus <span class="text-amber-400">&</span> & retrouvés
            </h1>
            <p class="text-xs text-slate-300 tracking-widest mt-1">
              ÉCOLE ALI
            </p>
          </div>
        </div>

        <RouterLink
          to="/login"
          class="inline-flex items-center justify-center min-h-[54px] min-w-[190px] px-8 py-4 bg-amber-400 hover:bg-amber-300 text-[#172B4D] rounded-xl text-base font-bold shadow-md transition duration-300 whitespace-nowrap"
        >
          Espace Admin →
        </RouterLink>

      </nav>
    </header>

    <!-- HERO SECTION -->
    <section class="w-full bg-[#172B4D] text-white p-0">
      <div class="w-full max-w-none mx-auto text-center">

        <h2 class="text-4xl md:text-6xl lg:text-7xl font-black mb-10">
          Objets perdus <span class="text-amber-400">&</span> retrouvés
        </h2>
        <br/><br/>

        <input
          v-model="search"
          type="text"
          placeholder="Rechercher un objet, un lieu..."
          class="inline-flex items-center justify-center min-h-[54px] min-w-[600px] px-10 py-4 bg-white hover:bg-gray-100 text-[#172B4D] rounded-xl text-base font-bold shadow-md transition duration-300 whitespace-nowrap"
        />

      </div>
      <br/>
    </section>

    <!-- MAIN CONTENT (flex-1 pousse le footer vers le bas) -->
    <main class="max-w-[1600px] mx-auto px-6 xl:px-16 py-12 flex-1 w-full">

      <!-- FILTRES DE CATÉGORIES -->
      <div class="flex flex-wrap items-center justify-center gap-3 mb-12">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'px-6 py-3 rounded-xl font-bold transition duration-200',
            selectedCategory === cat 
              ? 'bg-[#172B4D] text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- ALERTE ERREUR -->
      <div v-if="fetchError" class="max-w-2xl mx-auto mb-10 p-6 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-center font-bold">
        Erreur de chargement : {{ fetchError }}
      </div>

      <!-- INDICATEUR DE CHARGEMENT -->
      <div v-if="loading" class="text-center py-20 text-slate-500 font-medium">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#172B4D] border-t-transparent mb-4"></div>
        <p>Chargement des objets...</p>
      </div>

      <!-- GRILLE D'OBJETS -->
      <div v-else-if="filteredObjects.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div
          v-for="object in filteredObjects"
          :key="object.id"
          class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
        >
          <div>
            <!-- PHOTO -->
            <div class="h-56 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img
                v-if="object.image"
                :src="object.image"
                :alt="object.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="text-5xl opacity-30">
                📦
              </div>

              <span class="absolute top-4 left-4 bg-[#172B4D]/90 backdrop-blur-md text-amber-400 text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                {{ object.category || 'Objet' }}
              </span>
            </div>

            <!-- DÉTAILS -->
            <div class="p-6">
              <h3 class="text-xl font-extrabold text-[#172B4D] mb-3">
                {{ object.name }}
              </h3>

              <div class="space-y-2 text-sm text-slate-500 mb-4">
                <p class="flex items-center gap-2" v-if="object.location">
                  <span>📍</span> <strong>Lieu :</strong> {{ object.location }}
                </p>
                <p class="flex items-center gap-2" v-if="object.date">
                  <span>📅</span> <strong>Date :</strong> {{ object.date }}
                </p>
              </div>

              <p v-if="object.description" class="text-slate-600 text-sm line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {{ object.description }}
              </p>
            </div>
          </div>

          <!-- BOUTON "C'est à moi" -->
          <div class="p-6 pt-0">
            <button
              @click="claimObject(object.id)"
              class="w-full py-3 bg-[#172B4D] hover:bg-[#111f38] text-amber-400 font-bold rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2"
            >
              <span>✨</span> C'est à moi
            </button>
          </div>
        </div>
      </div>

      <!-- SI AUCUN RÉSULTAT -->
      <div v-else class="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="text-5xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-[#172B4D]">Aucun objet disponible</h3>
        <p class="text-slate-500 mt-2">
          {{ search ? 'Aucun objet ne correspond à votre recherche.' : 'Aucun objet n\'a encore été ajouté dans la base de données.' }}
        </p>
      </div>

    </main>

    <!-- FOOTER (mt-auto le garde bien collé en bas) -->
    <footer class="bg-[#172B4D] text-white mt-auto">
      <div class="max-w-[1600px] mx-auto px-8 xl:px-16 py-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p class="font-bold">
            Objets perdus <span class="text-amber-400">&</span>  & retrouvés – École Ali
          </p>
          <p class="text-slate-400 text-sm mt-1">
            Espace public pour les objets perdus.
          </p>
        </div>
        <p class="text-slate-400 text-sm">
          © École Ali
        </p>
      </div>
    </footer>

  </div>
</template>