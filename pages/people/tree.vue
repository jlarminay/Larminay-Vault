<script setup lang="ts">
definePageMeta({
  middleware: 'authorized-only',
});

const personStore = usePersonStore();
const allPersons = ref(await personStore.getAll());
const tree = [
  {
    firstPerson: {
      ...findPerson(1),
    },
    secondPerson: {
      ...findPerson(2),
    },
    children: [
      {
        firstPerson: {
          ...findPerson(3),
        },
        secondPerson: {
          ...findPerson(4),
        },
        children: [
          {
            firstPerson: {
              ...findPerson(5),
            },
            secondPerson: {
              ...findPerson(6),
            },
            children: [
              {
                firstPerson: {
                  ...findPerson(1),
                },
                secondPerson: {
                  ...findPerson(2),
                },
              },
              {
                firstPerson: {
                  ...findPerson(3),
                },
              },
            ],
          },
          {
            firstPerson: {
              ...findPerson(4),
            },
            secondPerson: {
              ...findPerson(5),
            },
          },
        ],
      },
      {
        firstPerson: {
          ...findPerson(6),
        },
        secondPerson: {
          ...findPerson(1),
        },
      },
      {
        firstPerson: {
          ...findPerson(2),
        },
        secondPerson: {
          ...findPerson(3),
        },
        children: [
          {
            firstPerson: {
              ...findPerson(4),
            },
          },
          {
            firstPerson: {
              ...findPerson(5),
            },
          },
          {
            firstPerson: {
              ...findPerson(6),
            },
          },
        ],
      },
    ],
  },
];

function findPerson(id: number) {
  return allPersons.value.find((person: any) => person.id === id);
}

function cardClick(person: any) {
  console.log('Card clicked', person);
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
        <h1 class="h1">Family Tree</h1>
      </div>

      <div class="tw_mt-6 tw_flex tw_flex-wrap">
        <FamilyTree :tree="tree" @card-click="cardClick" />
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss"></style>
