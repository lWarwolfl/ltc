import { HOST, SITE_SHORT_NAME } from '@/config'
import { getLocaleWithProps } from '@/i18n/i18n-configs'
import { getCourses, localizedField } from '@/lib/content'
import { getTranslations } from 'next-intl/server'
import { ImageResponse } from 'next/og'

export const ogSize = { width: 1200, height: 630 }

export async function renderOgImage() {
  const locale = await getLocaleWithProps()
  const [t, courses] = await Promise.all([getTranslations('global.app'), getCourses()])

  const courseTitles = courses.map((course) => localizedField(course.title, locale.locale))
  const isRtl = locale.direction === 'rtl'

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0a0a0a',
        color: '#fafafa',
        padding: 72,
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 16,
            background: '#E34F26',
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {'</>'}
        </div>
        <div style={{ fontSize: 30, color: '#a1a1a1' }}>{SITE_SHORT_NAME}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.15, maxWidth: 960 }}>
          {t('tagline')}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 28, color: '#a1a1a1' }}>
          {courseTitles.map((title) => (
            <div
              key={title}
              style={{
                display: 'flex',
                border: '2px solid #27272a',
                borderRadius: 999,
                padding: '10px 26px',
              }}
            >
              {title}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 26, color: '#71717a' }}>
        {HOST.replace(/^https?:\/\//, '')}
      </div>
    </div>,
    ogSize
  )
}
