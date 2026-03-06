"use client";
import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import PersonNode from './PersonNode';

const nodeTypes = {
  person: PersonNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Computes graph layouts with Dagre
const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const nodeWidth = 200;
  const nodeHeight = 80;

  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function FamilyTreeGraph({ persons }: { persons: any[] }) {
  const [edgeType, setEdgeType] = React.useState('default');

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: any[] = [];
    const edges: any[] = [];

    // Create Nodes
    (persons || []).forEach(p => {
      nodes.push({
        id: p.id,
        type: 'person',
        data: { ...p },
        position: { x: 0, y: 0 } // Computed by Dagre later
      });
      
      // Create Edges
      if (p.motherId) {
        edges.push({
          id: `e-${p.motherId}-${p.id}`,
          source: p.motherId,
          target: p.id,
          type: edgeType,
          style: { stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1.5, strokeDasharray: '4 4' },
        });
      }
      if (p.fatherId) {
        edges.push({
          id: `e-${p.fatherId}-${p.id}`,
          source: p.fatherId,
          target: p.id,
          type: edgeType,
          style: { stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1.5, strokeDasharray: '4 4' },
        });
      }
    });

    return getLayoutedElements(nodes, edges);
  }, [persons, edgeType]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Recalculate layout if data changes
  React.useEffect(() => {
     const layouted = getLayoutedElements(initialNodes, initialEdges);
     setNodes([...layouted.nodes]);
     setEdges([...layouted.edges]);
  }, [initialNodes, initialEdges, setNodes, setEdges]);


  if (persons.length === 0) {
    return <div className="flex flex-col items-center justify-center" style={{ flex: 1, minHeight: '400px', color: 'var(--text-secondary)' }}>
      Füge Personen hinzu, um den Baum zu sehen.
    </div>;
  }

  return (
    <div style={{ width: '100%', height: '70vh', background: 'transparent', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={40} color="rgba(255,255,255,0.02)" />
        <Panel position="top-right" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Liniendesign</span>
          <select 
            value={edgeType} 
            onChange={(e) => setEdgeType(e.target.value)}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: '6px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="default" style={{ color: 'black' }}>Geschwungen (Bezier)</option>
            <option value="smoothstep" style={{ color: 'black' }}>Abgerundet (Smoothstep)</option>
            <option value="straight" style={{ color: 'black' }}>Gerade (Straight)</option>
          </select>
        </Panel>
      </ReactFlow>
      <style>{`
        .tree-node:hover {
          transform: translateY(-4px) scale(1.02);
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
        }
        .react-flow__edge-path {
          transition: stroke 0.3s ease, d 0.5s ease;
        }
        .react-flow__edge:hover .react-flow__edge-path {
          stroke: rgba(255, 255, 255, 0.5) !important;
          stroke-width: 2px !important;
        }
      `}</style>
    </div>
  );
}
