import type { ReactNode } from 'react'

const RTL_RUN = /([\u0600-\u06FF\u200C\u200D]+)/
const LTR_RUN = /[A-Za-z0-9<>]/

export function bidiText(text: string): ReactNode {
  return text
    .split(RTL_RUN)
    .map((part, index) => (LTR_RUN.test(part) ? <bdi key={index}>{part}</bdi> : part))
}
