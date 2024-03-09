<script setup lang="ts">
const emits = defineEmits(['card-click']);
const props = defineProps({
  tree: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const wrapper = ref(null);
const familyTree = ref(null);
const currentZoom = ref(0.5);
const isDragging = ref(false);
const startPosition = ref({ x: 0, y: 0 });
const position = ref({ x: 0, y: 0 });

watch(
  () => [props.tree, wrapper.value, familyTree.value],
  () => {
    resetView();
  },
  { immediate: true },
);

function resetView() {
  currentZoom.value = 0.5;
  if (props.tree.length === 0 || !wrapper.value || !familyTree.value) return;

  // get width and height of the family tree
  // then center it in the wrapper
  const wrapperWidth = wrapper.value.clientWidth;
  const wrapperHeight = wrapper.value.clientHeight;
  const familyTreeWidth = familyTree.value.clientWidth;
  const familyTreeHeight = familyTree.value.clientHeight;
  position.value = {
    x: (wrapperWidth - familyTreeWidth) / 2,
    y: (wrapperHeight - familyTreeHeight) / 2,
  };
}

function handleScroll(event: any) {
  if (event.deltaY > 0) {
    currentZoom.value -= 0.05;
  } else {
    currentZoom.value += 0.05;
  }
  currentZoom.value = Math.round(Math.min(1.5, Math.max(0.1, currentZoom.value)) * 100) / 100;
}
function startDrag(event) {
  isDragging.value = true;
  startPosition.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y,
  };

  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', stopDrag);
}
function drag(event) {
  if (isDragging.value) {
    position.value = {
      x: event.clientX - startPosition.value.x,
      y: event.clientY - startPosition.value.y,
    };
  }
}
function stopDrag() {
  isDragging.value = false;
  window.removeEventListener('mousemove', drag);
  window.removeEventListener('mouseup', stopDrag);
}
</script>

<template>
  <div class="tw_w-full tw_border tw_h-[600px] tw_rounded tw_bg-gray-300">
    <!-- Controls -->
    <div
      class="tw_bg-white tw_px-2 tw_py-1 tw_inline-block tw_absolute tw_rounded-br tw_border-r tw_border-b tw_z-10"
    >
      Zoom: {{ currentZoom }}
    </div>

    <!-- Display -->
    <div
      v-if="tree.length > 0"
      ref="wrapper"
      id="family-tree"
      class="tw_relative tw_overflow-hidden tw_w-full tw_h-full"
      @wheel.prevent="handleScroll"
    >
      <div
        ref="familyTree"
        class="tw_absolute tw_cursor-grab active:tw_cursor-grabbing tw_bg-white tw_rounded tw_p-96"
        :style="{
          top: position.y + 'px',
          left: position.x + 'px',
          transform: `scale(${currentZoom})`,
        }"
        @mousedown="startDrag"
      >
        <FamilyTreeBranch :tree="tree" @card-click="emits('card-click', $event)">
          <template v-slot:card="{ item }">
            <slot name="card" :item="item" />
          </template>
        </FamilyTreeBranch>
      </div>
    </div>

    <div
      v-if="tree.length === 0"
      class="tw_w-full tw_h-full tw_flex tw_justify-center tw_items-center tw_text-lg"
    >
      <span v-if="loading">Loading Family Tree</span>
      <span v-else>Error Displaying Family Tree</span>
    </div>
  </div>
</template>
