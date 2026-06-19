import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const docsDir = join(root, 'docs')
const distDir = join(root, 'dist')

await rm(docsDir, { recursive: true, force: true })
await mkdir(docsDir, { recursive: true })
await cp(join(distDir, 'index.html'), join(docsDir, 'index.html'))
await cp(join(distDir, 'assets'), join(docsDir, 'assets'), { recursive: true })

const htmlPath = join(docsDir, 'index.html')
const html = await readFile(htmlPath, 'utf8')
await writeFile(htmlPath, html.replaceAll('../assets/', './assets/'))
