<script setup lang="ts">
import type { Elements } from '@vue-flow/core';
import { VueFlow, useVueFlow, Handle, Position } from '@vue-flow/core';
import { ControlButton, Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';

definePageMeta({
  middleware: 'authorized-only',
});

updateTreeLayout();

const { nodes, edges, updateEdge, addEdges, toObject, fromObject } = useVueFlow();
const elements = ref<Elements>([
  // // nodes
  // // an input node, specified by using `type: 'input'`
  // { id: '1', type: 'special', position: { x: 250, y: 5 }, data: { type: 'person' } },
  // // default node, you can omit `type: 'default'` as it's the fallback type
  // { id: '2', type: 'special', position: { x: 100, y: 100 }, data: { type: 'person' } },
  // // An output node, specified by using `type: 'output'`
  // { id: '3', type: 'special', position: { x: 400, y: 200 }, data: { type: 'connection' } },
  // {
  //   id: '4',
  //   type: 'special',
  //   position: { x: 400, y: 200 },
  //   data: {
  //     // custom data goes here
  //     type: 'person',
  //     hello: 'world',
  //   },
  // },
  // // edges
  // { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  // { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  // { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
]);
const saved = ref<any>([]);

function addNewNode(type) {
  // random num between 0 and 100000
  const id = Math.floor(Math.random() * 100000);
  elements.value.push({
    id: id,
    type: 'special',
    position: { x: 0, y: 0 },
    data: {
      type: type,
      id: id,
    },
  });
}
function removeNode(id: string) {
  // in elements remove all nodes that have id, there may be multiple
  elements.value = elements.value.filter((el) => {
    return el.id !== id && el.source !== id && el.target !== id;
  });
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

      <div class="tw_mt-6 tw_max-w-[800px] tw_h-[600px] tw_mx-auto">
        <q-btn @click="addNewNode('person')" label="Add new person" />
        <q-btn @click="addNewNode('connection')" label="Add new connection" />
        <q-btn @click="saved = JSON.stringify(toObject())" label="Save" />
        <q-btn @click="fromObject(JSON.parse(saved))" label="Restore" />

        <VueFlow
          v-model="elements"
          fit-view-on-init
          class="tw_border tw_rounded"
          @connect="
            console.log($event);
            addEdges([{ ...$event, type: 'smoothstep' }]);
          "
        >
          <Controls position="top-right" :showInteractive="true" />
          <MiniMap />

          <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
          <template #node-special="specialNodeProps">
            <!-- Person Node -->
            <div
              v-if="specialNodeProps.data.type === 'person'"
              class="tw_border tw_rounded tw_px-4 tw_py-2"
            >
              <Handle type="target" :position="Position.Left" />
              <Handle type="target" :position="Position.Right" />
              <Handle type="target" :position="Position.Bottom" />
              <Handle type="target" :position="Position.Up" />

              <div>
                special NODE
                <q-btn @click="removeNode(specialNodeProps.id)" label="Remove" />
                <pre>{{ specialNodeProps.data }}</pre>
              </div>
            </div>

            <!-- Connection Node -->
            <div
              v-if="specialNodeProps.data.type === 'connection'"
              class="tw_border tw_rounded-full tw_p-4"
            >
              <Handle type="target" :position="Position.Left" />
              <Handle type="target" :position="Position.Right" />
              <Handle type="target" :position="Position.Bottom" />
            </div>
          </template>
        </VueFlow>

        <div class="tw_text-xs">
          <pre>{{ saved }}</pre>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/controls/dist/style.css';
</style>
