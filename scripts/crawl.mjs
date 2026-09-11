import { load } from 'cheerio'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'https://www.w3schools.com'
const OUT = join(process.cwd(), 'content', 'en')

const COURSES = [
  { id: 'html', name: 'HTML', order: 1 },
  { id: 'css', name: 'CSS', order: 2 },
  { id: 'js', name: 'JavaScript', order: 3 },
]

const SKIP_HREF =
  /^default\.asp$|exercise|challenge|quiz|certificate|cssref|jsref|reference|editor|templates|examples|snippets|website|syllabus|study.plan|interview|tryit|exam/i

const JUNK = [
  '#mainLeaderboard',
  '.nextprev',
  '.w3-clear',
  '.ws-share',
  '.w3-hide',
  '.w3-left',
  '.w3-right',
  '.ws-black',
  '.w3-bar',
  '.ws-container',
  '.w3-container',
  '.sn-ad',
  '.ad',
  '.w3-round',
]

const clean = (s) => s.replace(/\u00a0/g, ' ').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchHtml(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; LTC-course-crawler/1.0)' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (error) {
      if (i === tries) throw error
      await sleep(500 * i)
    }
  }
}

function codeLang(el, $) {
  const cls = $(el).attr('class') || ''
  const m = cls.match(/(html|css|js|javascript|xml|sql|json|bash)High/i)
  if (!m) return 'text'
  const v = m[1].toLowerCase()
  return v === 'javascript' ? 'js' : v
}

function codeText(el, $) {
  const html = $(el).html() || ''
  const withBreaks = html.replace(/<br\s*\/?>/gi, '\n')
  const $frag = load(`<div>${withBreaks}</div>`)
  return clean($frag('div').text())
}

function readTable(el, $) {
  const rows = []
  const $rows = $(el).find('tr')
  $rows.each((_, tr) => {
    const cells = []
    $(tr)
      .find('th,td')
      .each((_, c) => cells.push(clean($(c).text())))
    if (cells.length) rows.push(cells)
  })
  if (!rows.length) return null
  const first = $rows.first()
  const isHeaderRow = first.children('th').length > 0 && first.children('td').length === 0
  const headers = isHeaderRow ? rows.shift() : []
  return { type: 'table', headers, rows }
}

function extract(html, url) {
  const $ = load(html)
  // strip script/style/ads/nav from the whole tree before walking: inline share-bar
  // scripts live inside plain divs and would otherwise leak in as paragraph text
  $('script, style, noscript, iframe, link, meta, hr').remove()
  $('#mainLeaderboard, #mainLeaderboard2, .nextprev, .ws-share, .w3-clear, .sn-ad, #w3_cert_cta').remove()
  $('[id^="div-gpt-ad"], [class*="adsbygoogle"]').remove()
  const $main = $('#main')
  const blocks = []
  const push = (b) => {
    if (b && b.type) blocks.push(b)
  }

  const isJunk = (el) => {
    const cls = $(el).attr('class') || ''
    const id = $(el).attr('id') || ''
    return JUNK.some((sel) => {
      if (sel.startsWith('#')) return id === sel.slice(1)
      if (sel.startsWith('.')) return cls.split(/\s+/).includes(sel.slice(1))
      return false
    })
  }

  const walk = (parent) => {
    $(parent)
      .children()
      .each((_, el) => {
        const tag = (el.tagName || '').toLowerCase()
        if (isJunk(el)) return
        const $el = $(el)

        if (tag === 'div' && ($el.hasClass('w3-example') || $el.hasClass('w3-example2') || $el.hasClass('ws-example'))) {
          const caption = clean($el.find('h3').first().text()) || null
          $el.find('.w3-code, .ws-code, pre').each((__, c) => {
            const text = codeText(c, $)
            if (text) push({ type: 'code', lang: codeLang(c, $), text, caption })
          })
          const href = $el.find('a[href*="tryit"]').first().attr('href')
          if (href) push({ type: 'tryit', url: new URL(href, BASE).href })
          return
        }

        if (tag === 'div' && ($el.hasClass('w3-panel') || $el.hasClass('ws-panel'))) {
          const cls = $el.attr('class') || ''
          const variant = /warning|w3-red|ws-red/.test(cls)
            ? 'warning'
            : /tip|ws-green/.test(cls)
              ? 'tip'
              : 'note'
          const text = clean($el.text()).replace(/^(Note|Warning|Tip):\s*/i, '')
          if (text) push({ type: 'note', variant, text })
          return
        }

        if (tag === 'blockquote') {
          const text = clean($el.text())
          if (text) push({ type: 'note', variant: 'note', text })
          return
        }

        if (/^h[1-6]$/.test(tag)) {
          const text = clean($el.text()).replace(/\s*▶\s*$/, '')
          if (!text || /^exercise\??$/i.test(text) || /^[?]+$/.test(text)) return
          push({ type: tag === 'h1' ? 'h1' : tag === 'h3' ? 'h3' : 'h2', text })
          return
        }

        if (tag === 'p') {
          const text = clean($el.text())
          if (text) push({ type: 'p', text })
          return
        }

        if (tag === 'ul' || tag === 'ol') {
          const items = []
          $el.children('li').each((__, li) => {
            const t = clean($(li).text())
            if (t) items.push(t)
          })
          if (items.length) push({ type: 'list', ordered: tag === 'ol', items })
          return
        }

        if (tag === 'table') {
          const t = readTable(el, $)
          if (t) push(t)
          return
        }

        if (tag === 'img') {
          const src = $el.attr('src')
          if (src) push({ type: 'image', src: new URL(src, BASE).href, alt: $el.attr('alt') || '' })
          return
        }

        if (tag === 'div') {
          if ($el.children('img').length === 1 && $el.children().length === 1) {
            const $img = $el.children('img').first()
            push({
              type: 'image',
              src: new URL($img.attr('src'), BASE).href,
              alt: $img.attr('alt') || '',
            })
            return
          }
          if ($el.find('h1,h2,h3,p,ul,ol,table,div,img').length) {
            walk(el)
            return
          }
          const text = clean($el.text())
          if (text.length > 2) push({ type: 'p', text })
          return
        }

        const text = clean($el.text())
        if (text.length > 2) push({ type: 'p', text })
      })
  }

  walk($main.length ? $main : $('body'))

  const title = clean($('#main h1').first().text()).replace(/\s*▶\s*$/, '') || clean($('title').text())

  return { slug: '', course: '', order: 0, url, title, blocks }
}

function sectionsFromSidebar(html) {
  const $ = load(html)
  const seen = new Set()
  const items = []
  $('#leftmenuinnerinner a').each((_, a) => {
    const href = $(a).attr('href')
    if (!href || !href.endsWith('.asp') || href.includes('?') || href.includes('#') || href.includes('/'))
      return
    if (seen.has(href) || SKIP_HREF.test(href)) return
    seen.add(href)
    items.push({ slug: href.slice(0, -4).toLowerCase() })
  })
  return items
}

async function buildCourse(course) {
  console.log(`\n[${course.id}] fetching sidebar`)
  const sidebar = await fetchHtml(`${BASE}/${course.id}/default.asp`)
  const sections = sectionsFromSidebar(sidebar)
  console.log(`[${course.id}] ${sections.length} sections`)

  const failures = []
  const dir = join(OUT, course.id)
  await mkdir(dir, { recursive: true })

  const queue = [...sections.entries()]
  const CONCURRENCY = 6

  async function worker() {
    while (queue.length) {
      const [order, section] = queue.shift()
      const file = join(dir, `${section.slug}.json`)
      if (existsSync(file)) {
        continue
      }
      try {
        const page = await fetchHtml(`${BASE}/${course.id}/${section.slug}.asp`)
        const lesson = extract(page, `/${course.id}/${section.slug}.asp`)
        lesson.slug = section.slug
        lesson.course = course.id
        lesson.order = order
        await writeFile(file, JSON.stringify(lesson, null, 1), 'utf8')
        process.stdout.write(`  ${order + 1}/${sections.length} ${section.slug}\r`)
      } catch (error) {
        failures.push(section.slug)
        console.error(`\n  FAILED ${section.slug}: ${error.message}`)
      }
      await sleep(120)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const written = sections.filter((section) => existsSync(join(dir, `${section.slug}.json`))).length
  console.log(`\n[${course.id}] done, ${written}/${sections.length} ok`)

  return { id: course.id, name: course.name, order: course.order, sections: written, failed: failures }
}

async function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  const targets = ids.length ? COURSES.filter((c) => ids.includes(c.id)) : COURSES
  await mkdir(OUT, { recursive: true })
  const results = []
  for (const course of targets) results.push(await buildCourse(course))
  await writeFile(join(process.cwd(), 'content', 'crawl-report.json'), JSON.stringify(results, null, 1), 'utf8')
  for (const r of results) console.log(`  ${r.id}: ${r.sections} sections, ${r.failed.length} failed`)
}

main()
