<script setup lang="ts">
definePageMeta({
  middleware: 'authorized-only',
});

const systemStore = useSystemStore();
const personStore = usePersonStore();
const systemData = ref(await systemStore.getAll());
const allPersons = ref(await personStore.getAll());
const loading = ref(true);
const cleanedTree = ref([]);

onMounted(async () => {
  cleanTree();
});

async function cleanTree() {
  // return tree but for each id replace it with the person object
  // go through json object recursively
  function replaceIdWithPerson(obj: any) {
    if (obj.firstPerson) {
      if (obj.firstPerson.id) obj.firstPerson = findPerson(obj.firstPerson.id);
    }
    if (obj.secondPerson) {
      if (obj.secondPerson.id) obj.secondPerson = findPerson(obj.secondPerson.id);
    }
    if (obj.children) {
      obj.children = obj.children.map((child: any) => replaceIdWithPerson(child));
    }
    return obj;
  }
  function findPerson(id: number) {
    return allPersons.value.find((person: any) => person.id === id);
  }

  loading.value = true;
  const tree = JSON.parse(JSON.parse(systemData.value.familyTree));
  let cleaned = tree.map((branch: any) => replaceIdWithPerson(branch));

  // add artificial delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  loading.value = false;
  cleanedTree.value = cleaned;
}
</script>

<template>
  <Head>
    <title>Family Tree | Larminay Vault</title>
  </Head>

  <div>
    <SingleNavMenu />

    <main class="tw_px-6 tw_py-4">
      <div class="tw_flex tw_items-center tw_max-w-[800px] tw_mx-auto tw_gap-2">
        <h1 class="h1">Family Tree</h1>
        <q-btn color="primary" round flat size="12px" icon="sym_o_edit" to="/people/tree/editor" />
      </div>

      <div class="tw_mt-6 tw_mx-auto">
        <FamilyTree :loading="loading" :tree="cleanedTree" />
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss"></style>
