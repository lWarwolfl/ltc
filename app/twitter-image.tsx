import { SITE_NAME } from '@/config'
import { ogSize, renderOgImage } from '@/components/common/og-image'

export const size = ogSize
export const contentType = 'image/png'
export const alt = SITE_NAME

export default renderOgImage
