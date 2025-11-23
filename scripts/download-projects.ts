#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { cloneProject } from '../src/download'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Parse URL and extract project ID, handling both stackblitz.com and stackblitz.zip domains
 */
function parseProjectUrl(url: string): string {
  // Handle both .com and .zip domains
  const match = url.match(/stackblitz\.(com|zip)\/edit\/([^/?#]+)/)

  if (!match || !match[2]) {
    throw new Error(`Invalid StackBlitz URL: ${url}`)
  }

  return match[2]
}

interface ProjectInfo {
  title: string
  icon: string
  url: string
  description: string
  stats: string[]
  lastUpdated: string
}

/**
 * Parse CSV content and extract project information
 */
function parseCSV(csvContent: string): ProjectInfo[] {
  const lines = csvContent.split('\n')
  const projects: ProjectInfo[] = []

  // Skip header row (index 0) and process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim())
      continue

    // Simple CSV parsing - split by comma but respect quoted fields
    const fields: string[] = []
    let currentField = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]

      if (char === '"') {
        inQuotes = !inQuotes
      }
      else if (char === ',' && !inQuotes) {
        fields.push(currentField)
        currentField = ''
      }
      else {
        currentField += char
      }
    }
    fields.push(currentField) // Add last field

    if (fields.length >= 8) {
      const title = fields[3] || ''
      const url = fields[2] || ''
      const description = fields[4] || ''

      // Only add if we have a valid URL
      if (url && url.includes('stackblitz.com/edit/')) {
        projects.push({
          title,
          icon: fields[1] || '',
          url,
          description,
          stats: [fields[5] || '0', fields[6] || '0'], // commits, forks
          lastUpdated: fields[7] || '',
        })
      }
    }
  }

  return projects
}

/**
 * Generate README.md content from project information
 */
function generateReadme(projects: ProjectInfo[]): string {
  let content = '# StackBlitz Projects\n\n'
  content += `This directory contains ${projects.length} cloned StackBlitz projects.\n\n`
  content += '## Project List\n\n'

  for (const project of projects) {
    const projectId = parseProjectUrl(project.url)
    content += `### ${project.title}\n\n`
    content += `- **URL**: [${project.url}](${project.url})\n`
    content += `- **Project ID**: \`${projectId}\`\n`
    if (project.description) {
      content += `- **Description**: ${project.description}\n`
    }
    if (project.stats.length >= 2) {
      content += `- **Stats**: ${project.stats[0]} commits, ${project.stats[1]} forks\n`
    }
    if (project.lastUpdated) {
      content += `- **Last Updated**: ${project.lastUpdated}\n`
    }
    content += `- **Local Path**: \`./projects/${projectId}\`\n\n`
  }

  return content
}

/**
 * Main function to download projects and generate README
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
  const listContent = readFileSync(listPath, 'utf-8')
  const urls = listContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'))

  console.log(`Found ${urls.length} URLs in list.txt`)

  // Read and parse CSV
  console.log('📄 Reading stackblitz.csv...')
  const csvContent = readFileSync(csvPath, 'utf-8')
  const projects = parseCSV(csvContent)
  console.log(`Parsed ${projects.length} projects from stackblitz.csv`)

  // Download each project
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    try {
      console.log(`\n[${i + 1}/${urls.length}] Processing: ${url}`)
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
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Generate README
  console.log('\n📝 Generating projects/README.md...')
  const readmeContent = generateReadme(projects)
  const readmePath = resolve(projectsDir, 'README.md')
  const { writeFile } = await import('node:fs/promises')
  await writeFile(readmePath, readmeContent, 'utf-8')
  console.log(`✅ README.md created at ${readmePath}`)

  // Summary
  console.log(`\n${'='.repeat(50)}`)
  console.log('📊 Summary:')
  console.log(`   Total URLs processed: ${urls.length}`)
  console.log(`   Successfully cloned: ${successCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log(`   README.md generated with ${projects.length} entries`)
  console.log('='.repeat(50))
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
