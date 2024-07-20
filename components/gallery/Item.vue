<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    required: true,
  },
  liked: {
    type: Boolean,
    default: false,
  },
  expandedView: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <a
    class="tw_inline-block tw_rounded tw_overflow-hidden tw_transition hover:tw_bg-slate-200 tw_p-0.5 sm:tw_p-2 tw_cursor-pointer"
    :data-lg-size="item.metadata.resolution.replace('x', '-')"
    :data-src="item.type === 'video' ? null : item.path"
    :data-video="
      item.type === 'video'
        ? `{&quot;source&quot;: [{&quot;src&quot;:&quot;${item.path}&quot;, &quot;type&quot;:&quot;video/mp4&quot;}], &quot;attributes&quot;: {&quot;preload&quot;: true, &quot;controls&quot;: true}}`
        : null
    "
    :data-poster="item.type === 'video' ? `${item.path}.thumbnail.webp` : null"
    :ariaDescribedby="item.description"
  >
    <div class="tw_relative tw_rounded">
      <img
        :src="`${item.path}.thumbnail.webp`"
        class="tw_w-full tw_aspect-square sm:tw_aspect-video tw_object-cover tw_rounded"
      />
      <span
        v-if="item.status !== 'processing' && item.type === 'video'"
        class="tw_absolute tw_bottom-0 tw_right-0 tw_px-2 tw_p-0.5 tw_bg-black tw_bg-opacity-60 tw_text-white tw_rounded-tl tw_rounded-br"
      >
        {{ formatDuration(item.metadata?.duration) }}
      </span>
      <div v-if="item.published !== 'public'" class="tw_absolute tw_top-1 tw_left-1">
        <q-icon
          name="lock"
          class="tw_absolute tw_text-white tw_blur-[2px] tw_opacity-30 tw_text-2xl tw_rounded-full tw_p-0.5"
        />
        <q-icon
          name="lock"
          class="tw_absolute tw_text-primary tw_text-2xl tw_rounded-full tw_p-0.5"
        />
      </div>
      <div v-if="liked" class="tw_absolute tw_top-1 tw_right-1">
        <q-icon
          name="o_favorite"
          class="tw_absolute tw_right-0 tw_text-white tw_blur-[2px] tw_opacity-30 tw_text-2xl tw_rounded-full tw_p-0.5"
        />
        <q-icon
          name="o_favorite"
          class="tw_absolute tw_right-0 tw_text-red-600 tw_text-2xl tw_rounded-full tw_p-0.5"
        />
      </div>
    </div>
    <div v-if="expandedView" class="tw_mt-2 tw_text-gray-500">
      <p
        v-for="(desc, i) in [
          { label: 'Uploaded:', value: item.createdAt },
          { label: 'Taken:', value: item.takenAt },
          { label: 'Desc:', value: item.description },
          { label: 'People:', value: item.people },
        ]"
        :key="i"
        class="tw_text-sm tw_truncate"
      >
        <b>{{ desc.label }}</b>
        {{ desc.value }}
      </p>
    </div>
  </a>
</template>

<style scoped lang="postcss"></style>