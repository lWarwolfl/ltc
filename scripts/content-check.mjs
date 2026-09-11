import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT = join(process.cwd(), 'content')
const BASE_LOCALE = 'en'
const isMeta = (name) =>
  name === 'index.json' || name === 'courses.json' || name === 'crawl-report.json'

const read = async (path) => JSON.parse(await readFile(path, 'utf8'))
const listDirs = async (path) =>
  (await readdir(path, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)
const listLessons = async (path) =>
  (await readdir(path)).filter((name) => name.endsWith('.json') && !isMeta(name))

const errors = []
const warnings = []

function signature(lesson) {
  return lesson.blocks.map((block) => `${block.type}:${block.type === 'code' ? block.text : ''}`)
}

function validate(locale, course, slug) {
  return (lesson, problems) => {
    const where = `${locale}/${course}/${slug}`

    if (!lesson.title) problems.push(`${where}: missing title`)
    if (!Array.isArray(lesson.blocks) || !lesson.blocks.length) problems.push(`${where}: no blocks`)

    for (const block of lesson.blocks ?? []) {
      if (block.type === 'code' && !block.text) problems.push(`${where}: empty code block`)
      if ((block.type === 'p' || block.type === 'h2' || block.type === 'h3') && !block.text)
        problems.push(`${where}: empty ${block.type} block`)
    }

    for (const [index, question] of (lesson.quiz ?? []).entries()) {
      if (!question.options?.length) problems.push(`${where}: quiz ${index} has no options`)
      if (typeof question.answer !== 'number' || question.answer < 0 || question.answer >= (question.options?.length ?? 0)) {
        problems.push(`${where}: quiz ${index} answer index out of range`)
      }
      if (!question.explanation) warnings.push(`${where}: quiz ${index} has no explanation`)
    }

    for (const task of lesson.tasks ?? []) {
      if (!task.prompt) problems.push(`${where}: task without prompt`)
    }
  }
}

async function buildIndexes(locale) {
  const root = join(CONTENT, locale)
  const courses = await listDirs(root)

  for (const course of courses) {
    const dir = join(root, course)
    const files = await listLessons(dir)
    const lessons = []
    const problems = []

    for (const file of files) {
      const lesson = await read(join(dir, file))
      const check = validate(locale, course, lesson.slug ?? file.replace('.json', ''))
      check(lesson, problems)
      lessons.push({
        slug: lesson.slug ?? file.replace('.json', ''),
        title: lesson.title,
        order: lesson.order ?? 0,
        blocks: lesson.blocks?.length ?? 0,
        tasks: lesson.tasks?.length ?? 0,
        quiz: lesson.quiz?.length ?? 0,
      })
    }

    lessons.sort((a, b) => a.order - b.order)
    await writeFile(join(dir, 'index.json'), JSON.stringify(lessons, null, 1), 'utf8')
    errors.push(...problems)
    console.log(`  ${locale}/${course}: ${lessons.length} lessons indexed`)
  }

  const standalone = (await listLessons(root)).filter((name) => name !== 'index.json')
  for (const file of standalone) {
    const lesson = await read(join(root, file))
    const problems = []
    validate(locale, 'standalone', lesson.slug ?? file.replace('.json', ''))(lesson, problems)
    errors.push(...problems)
  }
  if (standalone.length) console.log(`  ${locale}: ${standalone.length} standalone pages checked`)
}

async function compareTranslations() {
  const locales = (await listDirs(CONTENT)).filter((locale) => locale !== BASE_LOCALE)
  const courses = await listDirs(join(CONTENT, BASE_LOCALE))
  let compared = 0
  let missing = 0

  for (const locale of locales) {
    for (const course of courses) {
      const baseDir = join(CONTENT, BASE_LOCALE, course)
      const targetDir = join(CONTENT, locale, course)
      if (!existsSync(targetDir)) {
        warnings.push(`${locale}/${course}: not translated yet`)
        continue
      }

      for (const file of await listLessons(baseDir)) {
        const target = join(targetDir, file)
        const slug = file.replace('.json', '')
        if (!existsSync(target)) {
          missing += 1
          continue
        }

        const [base, translated] = await Promise.all([read(join(baseDir, file)), read(target)])
        compared += 1

        if (translated.slug !== base.slug || translated.order !== base.order) {
          errors.push(`${locale}/${course}/${slug}: slug/order does not match source`)
        }

        const [a, b] = [signature(base), signature(translated)]
        if (a.length !== b.length) {
          errors.push(`${locale}/${course}/${slug}: ${b.length} blocks vs ${a.length} in source`)
          continue
        }
        for (const [index, expected] of a.entries()) {
          if (expected !== b[index]) {
            errors.push(
              `${locale}/${course}/${slug}: block ${index} is "${b[index].split(':')[0]}", expected "${expected.split(':')[0]}"`
            )
            break
          }
        }
      }
    }
  }

  return { compared, missing }
}

async function main() {
  console.log('Building content indexes')
  for (const entry of await readdir(CONTENT, { withFileTypes: true })) {
    if (entry.isDirectory()) await buildIndexes(entry.name)
  }

  console.log('\nComparing translations against source')
  const { compared, missing } = await compareTranslations()
  console.log(`  compared: ${compared} lessons, missing: ${missing}`)

  for (const warning of warnings.slice(0, 20)) console.log(`  warn: ${warning}`)
  if (warnings.length > 20) console.log(`  ... ${warnings.length - 20} more warnings`)

  if (errors.length) {
    console.error(`\n${errors.length} problems:`)
    for (const error of errors.slice(0, 40)) console.error(`  ${error}`)
    if (errors.length > 40) console.error(`  ... ${errors.length - 40} more`)
    process.exit(1)
  }

  console.log('\nAll content checks passed')
}

main()
