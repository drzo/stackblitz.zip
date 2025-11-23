#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { cloneProject } from '../src/download'
import { generateReadme, parseProjectUrl, readProjectList, readProjectMetadata } from './utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Main function to download projects and generate README
 * Test version - only downloads first 3 projects
 */
async function main() {
  const rootDir = resolve(__dirname, '..')
  const listPath = resolve(rootDir, 'list.txt')
  const csvPath = resolve(rootDir, 'stackblitz.csv')
  const projectsDir = resolve(rootDir, 'projects')

  console.log('📂 Creating projects directory...')
  await mkdir(projectsDir, { recursive: true })

  // Read list.txt to get URLs
  console.log('📄 Reading list.txt...')
  const urls = readProjectList(listPath)
  console.log(`Found ${urls.length} URLs in list.txt`)

  // Read and parse CSV
  console.log('📄 Reading stackblitz.csv...')
  const projects = readProjectMetadata(csvPath)
  console.log(`Parsed ${projects.length} projects from stackblitz.csv`)

  // TEST MODE: Only download first 3 projects
  const testUrls = urls.slice(0, 3)
  console.log(`\n🧪 TEST MODE: Downloading only first ${testUrls.length} projects\n`)

  // Download each project
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i]
    try {
      console.log(`\n[${i + 1}/${testUrls.length}] Processing: ${url}`)
      const projectId = parseProjectUrl(url)
      const outputPath = resolve(projectsDir, projectId)

      await cloneProject({
        projectId,
        outputPath,
        verbose: false,
      })

      console.log(`✅ Successfully cloned: ${projectId}`)
      successCount++
    }
    catch (error) {
      console.error(`❌ Failed to clone ${url}:`, error instanceof Error ? error.message : error)
      failCount++
    }

    // Add a small delay to avoid rate limiting
    if (i < testUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Generate README
  console.log('\n📝 Generating projects/README.md...')
  const readmeContent = generateReadme(projects)
  const readmePath = resolve(projectsDir, 'README.md')
  await writeFile(readmePath, readmeContent, 'utf-8')
  console.log(`✅ README.md created at ${readmePath}`)

  // Summary
  console.log(`\n${'='.repeat(50)}`)
  console.log('📊 Summary:')
  console.log(`   Test URLs processed: ${testUrls.length}`)
  console.log(`   Successfully cloned: ${successCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log(`   README.md generated with ${projects.length} entries`)
  console.log('='.repeat(50))
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
