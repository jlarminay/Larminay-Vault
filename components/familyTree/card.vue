<script setup lang="ts">
const emits = defineEmits(['card-click']);
const props = defineProps({
  personData: {
    type: Object,
    required: true,
  },
});

function click() {
  emits('card-click', props.personData);
}
</script>

<template>
  <!-- <router-link
    :to="`/people`"
    @click.prevent="click"
    class="tw_w-24 tw_border tw_rounded tw_overflow-hidden tw_inline-block tw_transition-transform hover:tw_scale-105"
  >
    <div class="tw_w-full tw_h-24 tw_relative">
      <img
        :src="personData.image ? personData.image.path : null"
        :alt="personData.name"
        class="tw_w-full tw_h-full tw_object-cover"
      />
    </div>
    <div class="tw_text-center tw_font-bold tw_px-2 tw_p-1 tw_line-clamp-2">
      {{ personData.name }}
    </div>
  </router-link> -->
  <NuxtLink
    class="tw_border tw_inline-block tw_rounded tw_min-w-[170px]"
    :class="{
      'tw_bg-red-50': personData.gender === 'Female',
      'tw_bg-blue-50': personData.gender === 'Male',
      'tw_bg-purple-50': personData.gender === 'Other',
    }"
    :to="`/people/${personData.id}`"
  >
    <div
      class="tw_flex tw_flex-col tw_items-center tw_gap-4 tw_p-2 hover:tw_bg-gray-100 tw_transition-colors tw_duration-300"
    >
      <div
        class="tw_w-[100px] tw_h-[100px] tw_rounded-full tw_overflow-hidden tw_border-4"
        :class="{
          'tw_border-red-400': personData.gender === 'Female',
          'tw_border-blue-400': personData.gender === 'Male',
          'tw_border-purple-400': personData.gender === 'Other',
        }"
      >
        <img :src="personData.image ? personData.image.path : null" class="tw_object-cover" />
      </div>
      <div class="tw_flex-1 tw_text-center">
        <p class="tw_text-xl">{{ personData.name }}</p>
        <p>{{ $dayjs(personData.birthday).format('MMM D, YYYY') }}</p>
        <p class="tw_text-sm tw_opacity-80">{{ personData.videos }} videos</p>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped lang="postcss"></style>
