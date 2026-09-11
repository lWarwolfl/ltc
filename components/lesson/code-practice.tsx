import { CodeBlock } from '@/components/lesson/code-block'
import { getTranslations } from 'next-intl/server'
import { FolderCode } from 'lucide-react'

export type CodePracticeProps = {
  fileName: string
}

export default async function CodePractice({ fileName }: CodePracticeProps) {
  const t = await getTranslations('lesson')

  return (
    <div className="border-primary/40 bg-muted/30 flex flex-col gap-3 rounded-lg border border-s-2 p-4">
      <span className="flex items-center gap-2 text-sm font-medium">
        <FolderCode className="text-primary size-4" />
        {t('practice-title')}
      </span>

      <p className="text-muted-foreground text-sm leading-7">{t('practice-body')}</p>

      <CodeBlock code={fileName} className="w-fit" />
    </div>
  )
}
