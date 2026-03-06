import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useRouter } from 'next/navigation';

export default function PersonNode({ data }: { data: any }) {
  const router = useRouter();
  
  return (
    <div 
      className="tree-node"
      onClick={() => router.push(`/person/${data.id}`)}
      style={{
        padding: '16px 24px', 
        cursor: 'pointer', 
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '30px', /* very rounded pills */
        minWidth: '180px',
        textAlign: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <strong style={{ fontSize: '1.05rem', fontWeight: 500, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.95)', marginBottom: '4px' }}>
        {data.firstName} {data.lastName}
      </strong>
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {data.birthDate ? new Date(data.birthDate).getFullYear() : '?'} {data.deathDate ? `- ${new Date(data.deathDate).getFullYear()}` : ''}
      </span>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
