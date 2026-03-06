"use client";
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface TreeNode {
  person: any;
  partners: {
    partner: any | null;
    children: TreeNode[];
  }[];
}

export default function FamilyTree({ persons }: { persons: any[] }) {
  const router = useRouter();

  const treeRoots = useMemo(() => {
    let roots = persons.filter(p => !p.motherId && !p.fatherId);
    const visited = new Set<string>();

    const buildNode = (person: any): TreeNode | null => {
      if (visited.has(person.id)) return null;
      visited.add(person.id);

      const childrenOfPerson = persons.filter(p => p.motherId === person.id || p.fatherId === person.id);
      const partnersMap = new Map<string | null, any[]>();
      
      childrenOfPerson.forEach(child => {
        let partnerId = null;
        if (child.motherId === person.id) partnerId = child.fatherId;
        if (child.fatherId === person.id) partnerId = child.motherId;

        const key = partnerId || null;
        if (!partnersMap.has(key)) partnersMap.set(key, []);
        partnersMap.get(key)!.push(child);
      });

      const partners = Array.from(partnersMap.entries()).map(([partnerId, children]) => {
        let partner = null;
        if (partnerId) {
          partner = persons.find(p => p.id === partnerId);
          if (partner) visited.add(partner.id);
        }
        
        return {
          partner,
          children: children.map(c => buildNode(c)).filter(Boolean) as TreeNode[]
        };
      });

      return { person, partners };
    };

    const forest: TreeNode[] = [];
    for (const r of roots) {
      if (!visited.has(r.id)) {
        const node = buildNode(r);
        if (node) forest.push(node);
      }
    }

    // Capture disconnected graphs
    for (const p of persons) {
      if (!visited.has(p.id)) {
        const node = buildNode(p);
        if (node) forest.push(node);
      }
    }

    return forest;
  }, [persons]);

  const PersonCard = ({ person }: { person: any }) => (
    <div 
      className="glass-panel tree-node" 
      onClick={(e) => { e.stopPropagation(); router.push(`/person/${person.id}`); }}
      style={{ 
        padding: '12px 24px', 
        cursor: 'pointer', 
        border: '2px solid var(--accent)', 
        borderRadius: '12px',
        margin: '0', 
        zIndex: 2, 
        position: 'relative',
        background: 'var(--glass-bg)',
        minWidth: '160px',
        textAlign: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>{person.firstName} {person.lastName}</strong>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'} - {person.deathDate ? new Date(person.deathDate).getFullYear() : ''}
      </span>
    </div>
  );

  const renderNode = (node: TreeNode) => {
    return (
      <div key={node.person.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px' }}>
        
        {/* Parents Row */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <PersonCard person={node.person} />
          {node.partners.map((pGroup, i) => (
             <React.Fragment key={pGroup.partner?.id || i}>
                {pGroup.partner && (
                   <>
                      <div style={{ width: '40px', height: '2px', background: 'var(--accent)', position: 'relative' }}>
                         {pGroup.children.length > 0 && (
                            <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '20px', background: 'var(--accent)', transform: 'translateX(-50%)' }}></div>
                         )}
                      </div>
                      <PersonCard person={pGroup.partner} />
                   </>
                )}
             </React.Fragment>
          ))}
        </div>

        {/* Children Row */}
        {node.partners.some(p => p.children.length > 0) && (
           <div style={{ display: 'flex', gap: '20px' }}>
              {node.partners.map((pGroup, i) => {
                 if (pGroup.children.length === 0) return null;
                 
                 return (
                   <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {!pGroup.partner && (
                         <div style={{ width: '2px', height: '20px', background: 'var(--accent)' }}></div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        {pGroup.children.map((childNode, idx) => {
                           const isFirst = idx === 0;
                           const isLast = idx === pGroup.children.length - 1;
                           const isOnly = pGroup.children.length === 1;

                           return (
                             <div key={childNode.person.id} style={{ position: 'relative', padding: '20px 10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {!isOnly && (
                                   <>
                                     <div style={{ position: 'absolute', top: 0, left: isFirst ? '50%' : 0, right: '50%', height: '2px', background: 'var(--accent)' }}></div>
                                     <div style={{ position: 'absolute', top: 0, left: '50%', right: isLast ? '50%' : 0, height: '2px', background: 'var(--accent)' }}></div>
                                   </>
                                )}
                                <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '20px', background: 'var(--accent)', transform: 'translateX(-50%)' }}></div>
                                {renderNode(childNode)}
                             </div>
                           );
                        })}
                      </div>
                   </div>
                 );
              })}
           </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ overflowX: 'auto', padding: '40px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', minHeight: '600px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      {treeRoots.length === 0 ? (
        <div style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>Füge Personen hinzu, um den Baum zu sehen.</div>
      ) : (
        treeRoots.map(root => renderNode(root))
      )}
    </div>
  );
}
