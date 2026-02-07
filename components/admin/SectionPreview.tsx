'use client';

interface SectionPreviewProps {
  sectionKey: string;
  content: unknown;
}

type ContentRecord = Record<string, unknown>;

export default function SectionPreview({ sectionKey, content }: SectionPreviewProps) {
  const data = content as ContentRecord;

  // Render different previews based on section type
  switch (sectionKey) {
    case 'hero':
      return <HeroPreview data={data} />;
    case 'stats':
      return <StatsPreview data={data} />;
    case 'services':
      return <ServicesPreview data={data} />;
    case 'pricing':
      return <PricingPreview data={data} />;
    case 'testimonials':
      return <TestimonialsPreview data={data} />;
    case 'caseStudies':
      return <CaseStudiesPreview data={data} />;
    case 'about':
      return <AboutPreview data={data} />;
    case 'comparison':
      return <ComparisonPreview data={data} />;
    default:
      return <GenericPreview data={data} sectionKey={sectionKey} />;
  }
}

// Mini preview components for each section type
function HeroPreview({ data }: { data: ContentRecord }) {
  const retailHeadline = data.retailHeadline as ContentRecord | undefined;
  const tiers = data.tiers as Array<ContentRecord> | undefined;
  const ctaWords = data.ctaWords as string[] | undefined;

  return (
    <div style={{ padding: 16, background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1410 100%)' }}>
      <div style={{ fontSize: 8, letterSpacing: '0.2em', color: '#ED7F35', marginBottom: 8 }}>
        {String(data.industryBadge || '')}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 28, fontWeight: 200, color: '#ED7F35' }}>{String(data.yearsExperience || '')}</span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>{String(data.yearsLabel || '')}</span>
      </div>
      {tiers && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {tiers.slice(0, 3).map((tier, i) => (
            <div key={i} style={{
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
              borderLeft: `2px solid ${tier.color || '#ED7F35'}`,
            }}>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>{String(tier.tier || '')}</div>
              <div style={{ fontSize: 9, color: '#fff' }}>{String(tier.name || '')}</div>
            </div>
          ))}
        </div>
      )}
      {retailHeadline && (
        <div style={{ fontSize: 14, color: '#fff', marginBottom: 8 }}>
          <span>{String(retailHeadline.prefix || '')} </span>
          <span style={{ color: '#ED7F35' }}>{String(retailHeadline.highlight || '')}</span>
          <span> {String(retailHeadline.suffix || '')}</span>
        </div>
      )}
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 12, lineHeight: 1.4 }}>
        {String(data.retailDescription || '').slice(0, 100)}...
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          padding: '6px 12px',
          fontSize: 8,
          background: '#ED7F35',
          border: 'none',
          borderRadius: 4,
          color: '#fff',
        }}>
          {String(data.ctaPrimary || 'CTA')}
        </button>
        <button style={{
          padding: '6px 12px',
          fontSize: 8,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          color: '#fff',
        }}>
          {String(data.ctaSecondary || 'CTA')}
        </button>
      </div>
      {ctaWords && (
        <div style={{ marginTop: 12, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
          CTA Words: {ctaWords.join(' → ')}
        </div>
      )}
    </div>
  );
}

function StatsPreview({ data }: { data: ContentRecord }) {
  const items = data.items as Array<ContentRecord> | undefined;

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {items?.slice(0, 4).map((item, i) => (
          <div key={i} style={{
            padding: 12,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 300, color: '#ED7F35' }}>{String(item.stat || '')}</div>
            <div style={{ fontSize: 8, color: '#fff', marginTop: 4 }}>{String(item.label || '')}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>{String(item.sublabel || '')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesPreview({ data }: { data: ContentRecord }) {
  const selectableServices = data.selectableServices as Array<ContentRecord> | undefined;

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#ED7F35', marginBottom: 12 }}>Services</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {selectableServices?.slice(0, 4).map((svc, i) => (
          <div key={i} style={{
            padding: 8,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 9, color: '#fff' }}>{String(svc.name || '')}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>{String(svc.desc || '').slice(0, 40)}...</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 7, color: '#22C55E' }}>+{String(svc.immediate || 0)}%</div>
              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.3)' }}>immediate</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingPreview({ data }: { data: ContentRecord }) {
  const tiers = data.tiers as Array<ContentRecord> | undefined;

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#ED7F35', marginBottom: 12 }}>Pricing Tiers</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {tiers?.slice(0, 3).map((tier, i) => (
          <div key={i} style={{
            flex: 1,
            padding: 10,
            background: Boolean(tier.best) ? 'rgba(237, 127, 53, 0.1)' : 'rgba(255,255,255,0.03)',
            border: Boolean(tier.best) ? '1px solid #ED7F35' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 6,
          }}>
            <div style={{ fontSize: 8, color: Boolean(tier.best) ? '#ED7F35' : 'rgba(255,255,255,0.5)' }}>
              {String(tier.name || '')}
            </div>
            <div style={{ fontSize: 16, fontWeight: 300, color: '#fff', marginTop: 4 }}>
              ${String(tier.price || 0)}
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
            </div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {String(tier.tagline || '')}
            </div>
            {Boolean(tier.best) && (
              <div style={{
                marginTop: 6,
                padding: '2px 6px',
                background: '#ED7F35',
                borderRadius: 2,
                fontSize: 6,
                color: '#fff',
                display: 'inline-block',
              }}>
                BEST VALUE
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsPreview({ data }: { data: ContentRecord }) {
  const testimonials = Array.isArray(data) ? data : [];

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#ED7F35', marginBottom: 12 }}>Testimonials</div>
      {testimonials.slice(0, 2).map((t: ContentRecord, i: number) => (
        <div key={i} style={{
          padding: 10,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 6,
          marginBottom: 8,
          borderLeft: '2px solid #ED7F35',
        }}>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{String(t.quote || '').slice(0, 80)}..."
          </div>
          <div style={{ marginTop: 6, fontSize: 7 }}>
            <span style={{ color: '#fff' }}>{String(t.name || '')}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}> — {String(t.location || '')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CaseStudiesPreview({ data }: { data: ContentRecord }) {
  const caseStudies = Array.isArray(data) ? data : [];

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#ED7F35', marginBottom: 12 }}>Case Studies</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {caseStudies.slice(0, 4).map((cs: ContentRecord, i: number) => (
          <div key={i} style={{
            padding: 10,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 300, color: '#22C55E' }}>{String(cs.metric || '')}</div>
            <div style={{ fontSize: 7, color: '#fff', marginTop: 2 }}>{String(cs.label || '')}</div>
            <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{String(cs.client || '')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPreview({ data }: { data: ContentRecord }) {
  const directAccess = data.directAccessPromise as ContentRecord | undefined;

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #ED7F35, #C45E1A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: '#fff',
        }}>
          {String(data.founderName || 'AM').split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#fff' }}>{String(data.founderName || '')}</div>
          <div style={{ fontSize: 7, color: '#ED7F35' }}>{String(data.founderTitle || '')}</div>
        </div>
      </div>
      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, marginBottom: 12 }}>
        {String(data.founderBio || '').slice(0, 120)}...
      </p>
      {directAccess && (
        <div style={{
          padding: 10,
          background: 'rgba(237, 127, 53, 0.1)',
          borderRadius: 6,
          borderLeft: '2px solid #ED7F35',
        }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: '#ED7F35' }}>{String(directAccess.title || '')}</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            {String(directAccess.description || '').slice(0, 80)}...
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonPreview({ data }: { data: ContentRecord }) {
  const typical = data.typicalAgency as Array<ContentRecord> | undefined;
  const ic = data.intentionallyCreative as Array<ContentRecord> | undefined;

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#ED7F35', marginBottom: 12 }}>Comparison</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Typical Agency</div>
          {typical?.slice(0, 3).map((item, i) => (
            <div key={i} style={{
              fontSize: 7,
              color: 'rgba(255,255,255,0.5)',
              padding: '4px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              ✗ {String(item.text || '')}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 7, color: '#ED7F35', marginBottom: 6 }}>Intentionally Creative</div>
          {ic?.slice(0, 3).map((item, i) => (
            <div key={i} style={{
              fontSize: 7,
              color: '#22C55E',
              padding: '4px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              ✓ {String(item.text || '')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenericPreview({ data, sectionKey }: { data: ContentRecord; sectionKey: string }) {
  // Generic preview for unknown section types
  const previewData = Array.isArray(data) ? data.slice(0, 3) : data;

  return (
    <div style={{ padding: 16, background: '#0A0A0A' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#ED7F35', marginBottom: 12, textTransform: 'capitalize' }}>
        {sectionKey.replace(/([A-Z])/g, ' $1')}
      </div>
      {Array.isArray(previewData) ? (
        previewData.map((item, i) => (
          <div key={i} style={{
            padding: 8,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 4,
            marginBottom: 6,
            fontSize: 8,
            color: 'rgba(255,255,255,0.7)',
          }}>
            {typeof item === 'object' ? (
              Object.entries(item as ContentRecord).slice(0, 3).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 2 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}: </span>
                  <span>{String(v).slice(0, 40)}</span>
                </div>
              ))
            ) : (
              String(item)
            )}
          </div>
        ))
      ) : (
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
          {Object.entries(previewData).slice(0, 5).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}: </span>
              <span style={{ color: '#fff' }}>{typeof v === 'string' ? v.slice(0, 50) : JSON.stringify(v).slice(0, 50)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
