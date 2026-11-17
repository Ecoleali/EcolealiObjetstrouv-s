<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from './lib/supabase'

const categories = ['Sacs', 'Vêtements', 'Fournitures', 'Autres']
const objects = ref([])
const claims = ref([])
const search = ref('')
const searchClaim = ref('')
const showForm = ref(false)
const editingId = ref(null)
const previewImage = ref('')

const form = ref({
  name: '',
  category: '',
  location: '',
  date: '',
  description: ''
})

async function fetchObjects() {
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error('Erreur de chargement des objets:', error.message)
  } else {
    objects.value = data || []
  }
}

async function fetchClaims() {
  const { data, error } = await supabase
    .from('claims')
    .select('*, objects(*)')
    .order('id', { ascending: false })

  if (error) {
    console.error('Erreur de chargement des réclamations:', error.message)
  } else {
    claims.value = data || []
  }
}

onMounted(() => {
  fetchObjects()
  fetchClaims()
})

const filteredObjects = computed(() => {
  const query = search.value.toLowerCase().trim()
  if (!query) return objects.value

  return objects.value.filter(object =>
    (object.name && object.name.toLowerCase().includes(query)) ||
    (object.category && object.category.toLowerCase().includes(query)) ||
    (object.location && object.location.toLowerCase().includes(query))
  )
})

const filteredClaims = computed(() => {
  const query = searchClaim.value.toLowerCase().trim()
  if (!query) return claims.value

  return claims.value.filter(claim =>
    (claim.parent_name && claim.parent_name.toLowerCase().includes(query)) ||
    (claim.child_name && claim.child_name.toLowerCase().includes(query)) ||
    (claim.child_class && claim.child_class.toLowerCase().includes(query)) ||
    (claim.objects && claim.objects.name && claim.objects.name.toLowerCase().includes(query))
  )
})

function handleImage(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Veuillez choisir une image valide.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('La photo ne doit pas dépasser 5 Mo.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function resetForm() {
  form.value = {
    name: '',
    category: '',
    location: '',
    date: '',
    description: ''
  }
  previewImage.value = ''
  editingId.value = null
}

function toggleForm() {
  resetForm()
  showForm.value = !showForm.value
}

async function saveObject() {
  if (
    !form.value.name.trim() ||
    !form.value.category ||
    !form.value.location.trim() ||
    !form.value.date
  ) {
    alert('Veuillez remplir les champs obligatoires.')
    return
  }

  const payload = {
    name: form.value.name,
    category: form.value.category,
    location: form.value.location,
    date: form.value.date,
    description: form.value.description,
    image: previewImage.value
  }

  if (editingId.value) {
    const { error } = await supabase
      .from('objects')
      .update(payload)
      .eq('id', editingId.value)

    if (error) {
      alert('Erreur lors de la modification : ' + error.message)
      return
    }
  } else {
    const { error } = await supabase
      .from('objects')
      .insert([payload])

    if (error) {
      alert('Erreur lors de l\'ajout : ' + error.message)
      return
    }
  }

  await fetchObjects()
  resetForm()
  showForm.value = false
}

function editObject(object) {
  editingId.value = object.id
  form.value = {
    name: object.name,
    category: object.category,
    location: object.location,
    date: object.date,
    description: object.description || ''
  }
  previewImage.value = object.image || ''
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deleteObject(id) {
  if (confirm('Voulez-vous supprimer cet objet ?')) {
    const { error } = await supabase
      .from('objects')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    } else {
      objects.value = objects.value.filter(item => item.id !== id)
    }
  }
}

async function deleteClaim(id) {
  if (confirm('Voulez-vous supprimer cette réclamation (objet restitué) ?')) {
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    } else {
      claims.value = claims.value.filter(item => item.id !== id)
    }
  }
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#F7F8FC] text-slate-800 flex flex-col">
    <!-- HEADER -->
    <header class="bg-[#172B4D] text-white shadow-md">
      <div class="max-w-[1700px] mx-auto px-8 py-6 flex items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center">
            <span class="text-[#172B4D] text-2xl font-black">L</span>
          </div>
          <div>
            <h1 class="text-xl font-bold">
              Objets perdus <span class="text-amber-400">&</span> & retrouvés
            </h1>
            <p class="text-xs text-slate-300 tracking-widest mt-0.5">
              ÉCOLE ALI
            </p>
          </div>
        </div>
        <RouterLink
          to="/"
          class="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-[#172B4D] rounded-xl text-sm font-bold shadow-sm transition"
        >
          ← Retour au site
        </RouterLink>
      </div>
    </header>

    <!-- MAIN -->
    <main class="max-w-[1700px] w-full mx-auto flex-1 px-6 lg:px-12 py-10 space-y-12">
      
      <!-- TITLE BARRE -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <p class="text-amber-600 font-bold uppercase tracking-wider text-xs">
            Tableau de bord Supabase
          </p>
          <h2 class="text-3xl font-extrabold text-[#172B4D] mt-2">
            Espace administration
          </h2>
        </div>
        <button
          @click="toggleForm"
          class="bg-[#172B4D] text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-400 hover:text-[#172B4D] transition shadow-sm text-sm"
        >
          {{ showForm && !editingId ? 'Fermer le formulaire' : '+ Ajouter un objet' }}
        </button>
      </div>

      <!-- STATISTICS -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total des objets</p>
          <p class="text-4xl font-black text-[#172B4D] mt-3">
            {{ objects.length }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Réclamations en attente</p>
          <p class="text-4xl font-black text-amber-500 mt-3">
            {{ claims.length }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Catégories</p>
          <p class="text-4xl font-black text-[#172B4D] mt-3">
            {{ categories.length }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Résultats affichés</p>
          <p class="text-4xl font-black text-amber-500 mt-3">
            {{ filteredObjects.length }}
          </p>
        </div>
      </div>
<br> <br>
      <!-- FORM (Ajout/Modification) -->
      <section
        v-if="showForm"
        class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-10"
      >
        <div class="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-2xl font-extrabold text-[#172B4D]">
              {{ editingId ? 'Modifier un objet' : 'Ajouter un nouvel objet' }}
            </h3>
            <p class="text-slate-500 text-sm mt-1">
              Renseignez les informations ci-dessous pour mettre à jour le catalogue.
            </p>
          </div>
          <button
            @click="showForm = false; resetForm()"
            class="text-3xl text-slate-400 hover:text-red-500 transition"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="saveObject" class="space-y-6">
          <div class="grid lg:grid-cols-2 gap-8">
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-bold mb-2 text-[#172B4D]">Nom de l'objet *</label>
                <input
                  v-model="form.name"
                  required
                  placeholder="Ex : Sac à dos bleu"
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 font-medium text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-bold mb-2 text-[#172B4D]">Catégorie *</label>
                <select
                  v-model="form.category"
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 font-medium text-sm"
                >
                  <option value="" disabled>Choisir une catégorie</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold mb-2 text-[#172B4D]">Lieu de découverte *</label>
                <input
                  v-model="form.location"
                  required
                  placeholder="Ex : Bibliothèque"
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 font-medium text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-bold mb-2 text-[#172B4D]">Date de découverte *</label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 font-medium text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-bold mb-2 text-[#172B4D]">Description</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="Décrivez l'objet..."
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 font-medium text-sm"
                ></textarea>
              </div>
            </div>

            <!-- IMAGE SECTION -->
            <div class="flex flex-col">
              <label class="block text-sm font-bold mb-2 text-[#172B4D]">Photo de l'objet</label>
              <div class="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl flex-1 min-h-[320px] p-6 flex flex-col items-center justify-center text-center">
                <img
                  v-if="previewImage"
                  :src="previewImage"
                  class="w-full h-56 object-contain rounded-xl mb-4 shadow-sm"
                  alt="Aperçu"
                />
                <div v-else class="mb-4">
                  <div class="text-5xl mb-3">📷</div>
                  <p class="font-bold text-base text-[#172B4D]">Ajouter une photo</p>
                  <p class="text-slate-400 text-xs mt-1">PNG, JPG ou JPEG – Max 5 Mo</p>
                </div>
                <label class="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#172B4D] rounded-xl text-sm font-bold shadow-sm cursor-pointer transition">
                  {{ previewImage ? "Changer l'image" : 'Choisir une image' }}
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImage"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              @click="showForm = false; resetForm()"
              class="px-8 py-4 rounded-2xl border border-slate-200 font-bold hover:bg-slate-50 transition text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-8 py-4 rounded-2xl bg-amber-400 text-[#172B4D] font-bold hover:bg-amber-300 transition text-sm shadow-sm"
            >
              {{ editingId ? 'Enregistrer les modifications' : 'Publier l’objet' }}
            </button>
          </div>
        </form>
      </section>

      <!-- SECTION : RÉCLAMATIONS DES PARENTS -->
      <section class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-10">
        <div class="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
          <div>
            <h3 class="text-2xl font-extrabold text-[#172B4D]">Réclamations des parents ("C'est à moi")</h3>
            <p class="text-slate-500 text-sm mt-1">Gérez les demandes de récupération envoyées par les familles.</p>
          </div>
          <input
            v-model="searchClaim"
            placeholder="Rechercher par parent, élève ou objet..."
            class="w-full md:w-80 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[1000px]">
            <thead>
              <tr class="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th class="py-4 px-4">Objet réclamé</th>
                <th class="py-4 px-4">Parent</th>
                <th class="py-4 px-4">Contact</th>
                <th class="py-4 px-4">Élève & Classe</th>
                <th class="py-4 px-4">Message / Preuve</th>
                <th class="py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr
                v-for="claim in filteredClaims"
                :key="claim.id"
                class="hover:bg-slate-50/60 transition"
              >
                <!-- COLONNE OBJET RÉCLAMÉ (PHOTO + NOM) -->
                <td class="py-5 px-4">
                  <div class="flex items-center gap-3" v-if="claim.objects">
                    <img
                      v-if="claim.objects.image"
                      :src="claim.objects.image"
                      class="w-12 h-12 rounded-2xl object-cover shadow-sm flex-shrink-0"
                      :alt="claim.objects.name"
                    />
                    <div v-else class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-lg flex-shrink-0">
                      📦
                    </div>
                    <div>
                      <p class="font-bold text-[#172B4D]">{{ claim.objects.name }}</p>
                      <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{{ claim.objects.category }}</span>
                    </div>
                  </div>
                  <span v-else class="text-xs text-slate-400 italic">Objet supprimé ou introuvable</span>
                </td>

                <td class="py-5 px-4 font-bold text-[#172B4D]">{{ claim.parent_name }}</td>
                <td class="py-5 px-4 text-xs space-y-1">
                  <p class="font-medium text-slate-700">📧 {{ claim.email }}</p>
                  <p class="text-slate-500">📞 {{ claim.phone }}</p>
                </td>
                <td class="py-5 px-4 text-xs space-y-1">
                  <p class="font-bold text-slate-800">{{ claim.child_name }}</p>
                  <span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold inline-block">{{ claim.child_class }}</span>
                </td>
                <td class="py-5 px-4 text-xs text-slate-600 max-w-xs">
                  <p class="bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{{ claim.message || 'Aucune précision' }}</p>
                </td>
                <td class="py-5 px-4">
                  <button
                    @click="deleteClaim(claim.id)"
                    class="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition text-xs shadow-sm"
                  >
                    Restitué / Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="filteredClaims.length === 0"
            class="text-center py-12 text-slate-400 text-sm font-medium"
          >
            Aucune réclamation en attente pour le moment.
          </div>
        </div>
      </section>
<br> <br>
      <!-- OBJECT LIST -->
      <section class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-10">
        <div class="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
          <div>
            <h3 class="text-2xl font-extrabold text-[#172B4D]">Objets enregistrés</h3>
            <p class="text-slate-500 text-sm mt-1">Consultez et gérez les objets retrouvés dans Supabase.</p>
          </div>
          <input
            v-model="search"
            placeholder="Rechercher un objet..."
            class="w-full md:w-80 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[800px]">
            <thead>
              <tr class="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th class="py-4 px-4">Photo</th>
                <th class="py-4 px-4">Objet</th>
                <th class="py-4 px-4">Catégorie</th>
                <th class="py-4 px-4">Lieu</th>
                <th class="py-4 px-4">Date</th>
                <th class="py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr
                v-for="object in filteredObjects"
                :key="object.id"
                class="hover:bg-slate-50/60 transition"
              >
                <td class="py-5 px-4">
                  <img
                    v-if="object.image"
                    :src="object.image"
                    class="w-14 h-14 rounded-2xl object-cover shadow-sm"
                    :alt="object.name"
                  />
                  <div v-else class="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                    📦
                  </div>
                </td>
                <td class="py-5 px-4 font-bold text-[#172B4D]">{{ object.name }}</td>
                <td class="py-5 px-4 text-xs"><span class="bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700 font-bold">{{ object.category }}</span></td>
                <td class="py-5 px-4 text-slate-500 text-xs font-medium">{{ object.location }}</td>
                <td class="py-5 px-4 text-slate-500 text-xs font-medium">{{ object.date }}</td>
                <td class="py-5 px-4">
                  <div class="flex gap-4">
                    <button
                      @click="editObject(object)"
                      class="text-blue-600 hover:text-blue-800 font-bold text-xs transition"
                    >
                      Modifier
                    </button>
                    <button
                      @click="deleteObject(object.id)"
                      class="text-red-500 hover:text-red-700 font-bold text-xs transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="filteredObjects.length === 0"
            class="text-center py-12 text-slate-400 text-sm font-medium"
          >
            {{ search ? 'Aucun résultat ne correspond à votre recherche.' : 'Aucun objet enregistré pour le moment dans Supabase.' }}
          </div>
        </div>
      </section>

    </main>

    <!-- FOOTER -->
    <footer class="bg-[#172B4D] text-white mt-auto">
      <div class="max-w-[1700px] w-full mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <p class="font-bold">
          Objets perdus  <span class="text-amber-400">&</span> & retrouvés – École Ali
        </p>
        <p class="text-slate-400">
          Espace réservé à l'administration. © École Ali
        </p>
      </div>
    </footer>
  </div>
</template>