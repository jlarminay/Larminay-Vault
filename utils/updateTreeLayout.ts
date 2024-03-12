import dagre from 'dagre';
import { Position, useVueFlow } from '@vue-flow/core';

export default function (): void {
  console.log('updateTreeLayout');

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const { getEdges, getNodesInitialized, fitView } = useVueFlow();

  const onLayout = (direction: string) => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    getNodesInitialized.value.forEach((el) => {
      dagreGraph.setNode(el.id, { width: el.dimensions.width, height: el.dimensions.height });
    });

    getEdges.value.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    getNodesInitialized.value.forEach((el) => {
      const nodeWithPosition = dagreGraph.node(el.id);
      const hasPredecessors = dagreGraph.predecessors(el.id)?.length;
      el.targetPosition = isHorizontal ? Position.Left : Position.Top;
      el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
      el.position = { x: nodeWithPosition.x, y: nodeWithPosition.y };
      el.data = { ...el.data, hasPredecessors };
      el.style = {
        opacity: 1,
      };
    });

    fitView();
  };

  watch(
    [
      getNodesInitialized,
      getEdges,
      () => getNodesInitialized.value.length,
      () => getEdges.value.length,
    ],
    () => {
      onLayout('TB');
    },
  );
}
