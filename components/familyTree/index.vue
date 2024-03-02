<script setup lang="ts">
const emits = defineEmits(['card-click']);
const props = defineProps({
  tree: {
    type: Array,
    required: true,
  },
});

const currentZoom = ref(1);

function handleScroll(event: any) {
  if (event.deltaY > 0) {
    currentZoom.value -= 0.05;
  } else {
    currentZoom.value += 0.05;
  }
  currentZoom.value = Math.round(Math.min(1.5, Math.max(0.1, currentZoom.value)) * 100) / 100;
}
</script>

<template>
  <div class="tw_w-full tw_border tw_h-[600px] tw_rounded">
    <!-- Controls -->
    <div
      class="tw_bg-white tw_px-2 tw_py-1 tw_inline-block tw_absolute tw_rounded-br tw_border-r tw_border-b tw_z-10"
    >
      Zoom: {{ currentZoom }}
    </div>

    <!-- Display -->
    <div
      ref="wrapper"
      id="vue-family-tree"
      class="tw_relative tw_overflow-scroll tw_w-full tw_h-full"
      @wheel.prevent="handleScroll"
    >
      <div
        ref="vueFamilyTree"
        class="tw_absolute tw_p-4"
        :style="`transform: scale(${currentZoom})`"
      >
        <FamilyTreeBranch :tree="tree" @card-click="emits('card-click', $event)">
          <template v-slot:card="{ item }">
            <slot name="card" :item="item" />
          </template>
        </FamilyTreeBranch>
      </div>
    </div>
  </div>
</template>
