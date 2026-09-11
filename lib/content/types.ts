export type HeadingBlock = { type: 'h1' | 'h2' | 'h3'; text: string }
export type ParagraphBlock = { type: 'p'; text: string }
export type ListBlock = { type: 'list'; ordered: boolean; items: string[] }
export type CodeBlock = { type: 'code'; lang: string; text: string; caption: string | null }
export type TableBlock = { type: 'table'; headers: string[]; rows: string[][] }
export type NoteBlock = { type: 'note'; variant: 'note' | 'tip' | 'warning'; text: string }
export type ImageBlock = { type: 'image'; src: string; alt: string }
export type TryItBlock = { type: 'tryit'; url: string }

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | CodeBlock
  | TableBlock
  | NoteBlock
  | ImageBlock
  | TryItBlock

export type QuizQuestion = {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export type Task = {
  prompt: string
  hint?: string
}

export type Lesson = {
  slug: string
  course: string
  order: number
  url?: string
  title: string
  summary?: string
  objectives?: string[]
  blocks: Block[]
  tasks?: Task[]
  quiz?: QuizQuestion[]
}

export type SectionMeta = {
  slug: string
  title: string
  order: number
  blocks: number
  translated?: boolean
}

export type Course = {
  id: string
  order: number
  accent: string
  title: Record<string, string>
  description: Record<string, string>
}
