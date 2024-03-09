<script setup lang="ts">
import { format } from 'json-string-formatter';

definePageMeta({
  middleware: 'authorized-only',
});

const router = useRouter();
const systemStore = useSystemStore();
const personStore = usePersonStore();
const systemData = ref(await systemStore.getAll());
const allPersons = ref(await personStore.getAll());
const loading = ref(false);
const code = ref({
  text: '',
});

onMounted(() => {
  code.value.text = format(JSON.parse(systemData.value.familyTree));
});

async function saveFamilyTree() {
  loading.value = true;
  let newValue = JSON.stringify(code.value.text).replace(/\\n/g, '').replace(/\\t/g, '');
  const response = await systemStore.update('familyTree', newValue);
  loading.value = false;

  if (!response) {
    toaster({ type: 'error', message: 'Something went wrong.<br/>Please try again later.' });
    return;
  }
  toaster({ type: 'success', message: 'Successfully updated family tree.' });
  router.push('/people/tree');
}
</script>

<template>
  <Head>
    <title>Family Tree | Larminay Vault</title>
  </Head>

  <div>
    <SingleNavMenu />

    <main class="tw_px-6 tw_py-4">
      <div class="tw_flex tw_justify-between tw_items-start tw_max-w-[800px] tw_mx-auto">
        <h1 class="h1">Family Tree Editor</h1>
      </div>

      <div class="tw_mt-6 tw_max-w-[800px] tw_mx-auto tw_flex tw_gap-2">
        <q-form class="tw_grow" @submit.prevent="saveFamilyTree">
          <q-input v-model="code.text" type="textarea" outlined dense rows="30" />

          <div class="tw_flex tw_justify-end tw_items-center tw_gap-2 tw_mt-2">
            <q-btn
              no-caps
              unelevated
              rounded
              outline
              color="primary"
              label="Cancel"
              to="/people/tree"
            />
            <q-btn
              no-caps
              unelevated
              rounded
              :loading="loading"
              color="primary"
              label="Save"
              @click="saveFamilyTree"
            />
          </div>
        </q-form>

        <div class="tw_w-[300px] tw_flex tw_flex-col tw_gap-2">
          <div class="tw_border tw_rounded tw_p-2">
            <b>Example of Custom Person</b>
            <pre>
"name": "John",
"birthday": "1990-01-01",
"deathday": "2021-01-01",
"videos": null,
"gender": null, // Male, Female, Other, null
"image": {
  // path must be a public url or null
  "path": "https://via.placeholder.com/150"
}</pre
            >
          </div>
          <div>SEARCH FOR PEOPLE</div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss"></style>
