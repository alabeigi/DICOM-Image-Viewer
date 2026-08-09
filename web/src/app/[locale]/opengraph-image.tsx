import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'DICOM Image Viewer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #0D1117 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(51, 153, 255, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '84px',
            height: '84px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #3399FF 0%, #00D4AA 100%)',
            marginBottom: '36px',
            boxShadow: '0 8px 32px rgba(51, 153, 255, 0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '44px',
                borderRadius: '6px',
                border: '3px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '14px',
                  borderRadius: '5px',
                  background: 'rgba(255, 255, 255, 0.9)',
                }}
              />
            </div>
            <div
              style={{
                width: '20px',
                height: '4px',
                borderRadius: '2px',
                background: 'white',
                marginTop: '-6px',
              }}
            />
            <div
              style={{
                width: '26px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.6)',
                marginTop: '4px',
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#E6EDF3',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-1px',
          }}
        >
          DICOM Image Viewer
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#8B949E',
            textAlign: 'center',
            marginTop: '18px',
            lineHeight: 1.4,
            maxWidth: '720px',
          }}
        >
          Upload and view DICOM medical images with precision
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '36px',
          }}
        >
          {['Next.js 16', 'React 19', 'TypeScript 6'].map((tech) => (
            <div
              key={tech}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                background: 'rgba(51, 153, 255, 0.15)',
                border: '1px solid rgba(51, 153, 255, 0.3)',
                color: '#3399FF',
                fontSize: '17px',
                fontWeight: 600,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
