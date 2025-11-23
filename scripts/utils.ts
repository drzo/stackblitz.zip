import { readFileSync } from 'node:fs'

export interface ProjectInfo {
  title: string
  icon: string
  url: string
  description: string
  stats: string[]
  lastUpdated: string
}

/**
 * Parse URL and extract project ID, handling both stackblitz.com and stackblitz.zip domains
 */
export function parseProjectUrl(url: string): string {
  // Handle both .com and .zip domains
  const match = url.match(/stackblitz\.(com|zip)\/edit\/([^/?#]+)/)

  if (!match || !match[2]) {
    throw new Error(`Invalid StackBlitz URL: ${url}`)
  }

  return match[2]
}

/**
 * Parse CSV content and extract project information
 * Note: This is a simple CSV parser that works for the current data format.
 * It doesn't handle all edge cases like escaped quotes within quoted fields.
 * For production use with complex CSV data, consider using a library like papaparse.
 */
export function parseCSV(csvContent: string): ProjectInfo[] {
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

      // Validate URL using parseProjectUrl
      if (url) {
        try {
          parseProjectUrl(url)
          projects.push({
            title,
            icon: fields[1] || '',
            url,
            description,
            stats: [fields[5] || '0', fields[6] || '0'], // commits, forks
            lastUpdated: fields[7] || '',
          })
        }
        catch {
          // Skip invalid URLs
        }
      }
    }
  }

  return projects
}

/**
 * Read and parse list.txt file
 */
export function readProjectList(listPath: string): string[] {
  const listContent = readFileSync(listPath, 'utf-8')
  return listContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'))
}

/**
 * Read and parse stackblitz.csv file
 */
export function readProjectMetadata(csvPath: string): ProjectInfo[] {
  const csvContent = readFileSync(csvPath, 'utf-8')
  return parseCSV(csvContent)
}

/**
 * Generate README.md content from project information
 */
export function generateReadme(projects: ProjectInfo[]): string {
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
