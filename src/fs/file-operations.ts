import path from 'path';
import fs from 'fs-extra';
import { FilesystemOperations, ChangelogEntry } from '../types/index.js';
import logger, { logOperation } from '../utils/logger.js';

/**
 * Implementation of filesystem operations
 */
export class FilesystemOperationsImpl implements FilesystemOperations {
  private readonly changelogDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.changelogDir = path.join(rootDir, 'docs', 'changelogs');
  }

  /**
   * Ensure the changelog directory exists
   */
  async ensureChangelogDirectory(): Promise<string> {
    return logOperation('Ensure Changelog Directory', async () => {
      // Check if docs directory exists
      const docsDir = path.join(path.dirname(this.changelogDir));
      const docsExists = await fs.pathExists(docsDir);
      
      if (!docsExists) {
        logger.info(`Creating docs directory: ${docsDir}`);
        await fs.mkdir(docsDir, { recursive: true });
      }

      // Check if changelogs directory exists
      const changelogsExists = await fs.pathExists(this.changelogDir);
      
      if (!changelogsExists) {
        logger.info(`Creating changelogs directory: ${this.changelogDir}`);
        await fs.mkdir(this.changelogDir, { recursive: true });
      } else {
        logger.info(`Changelogs directory already exists: ${this.changelogDir}`);
      }

      return this.changelogDir;
    });
  }

  /**
   * Save a changelog entry to disk
   */
  async saveChangelog(entry: ChangelogEntry): Promise<void> {
    return logOperation(`Save Changelog: ${entry.id}`, async () => {
      // Ensure directory exists
      await this.ensureChangelogDirectory();

      // Create markdown content
      const filePath = path.join(this.changelogDir, `${entry.id}.md`);
      
      // Format the content according to the markdown structure
      const content = this.formatChangelogEntry(entry);
      
      // Write the file
      await fs.writeFile(filePath, content, 'utf8');
      logger.info(`Saved changelog to: ${filePath}`);
    });
  }

  /**
   * Get previous changelog entries
   */
  async getPreviousChangelogs(): Promise<ChangelogEntry[]> {
    return logOperation('Get Previous Changelogs', async () => {
      // Ensure directory exists
      await this.ensureChangelogDirectory();

      // Get all markdown files
      const files = await fs.readdir(this.changelogDir);
      const markdownFiles = files.filter(file => file.endsWith('.md'));

      logger.info(`Found ${markdownFiles.length} previous changelog entries`);

      // Load and parse each file
      const changelogs: ChangelogEntry[] = [];

      for (const file of markdownFiles) {
        try {
          const filePath = path.join(this.changelogDir, file);
          await fs.readFile(filePath, 'utf8');
          
          // In a real implementation, we would parse the markdown to extract the changelog data
          // This is simplified for this example
          // For now, we'll just create a placeholder entry
          
          const id = file.replace('.md', '');
          changelogs.push({
            id,
            timestamp: '',
            changes: [],
            relatedChangelogs: [],
            reasoning: ''
          });
        } catch {
          logger.error(`Failed to parse changelog: ${file}`);
        }
      }

      return changelogs;
    });
  }

  /**
   * Format a changelog entry as markdown
   */
  private formatChangelogEntry(entry: ChangelogEntry): string {
    // Group changes by category
    const categorizedChanges = entry.changes.reduce((acc: Record<string, typeof entry.changes>, change) => {
      const category = 'Uncategorized'; // In a real implementation, we would use the AI-generated categories
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(change);
      return acc;
    }, {} as Record<string, typeof entry.changes>);

    // Build markdown content
    let content = `# Changelog Entry: ${entry.id}\n`;
    content += `**Timestamp:** ${entry.timestamp}\n\n`;

    // Add changes by category
    content += '## Changes\n';
    for (const [category, changes] of Object.entries(categorizedChanges)) {
      content += `### ${category}\n`;
      for (const change of changes) {
        content += `- **${change.file}** (${change.type}): ${change.description}\n`;
        if (change.diff) {
          content += `\`\`\`diff\n${change.diff}\n\`\`\`\n`;
        }
      }
      content += '\n';
    }

    // Add related changelogs
    if (entry.relatedChangelogs.length > 0) {
      content += '## Related Changelogs\n';
      for (const related of entry.relatedChangelogs) {
        content += `- [${related.id}](${related.id}.md) (${related.timestamp}): ${related.relationshipType} (Strength: ${related.relationshipStrength})\n`;
      }
      content += '\n';
    }

    // Add reasoning
    content += `## AI Reasoning\n${entry.reasoning}\n`;

    return content;
  }
}
