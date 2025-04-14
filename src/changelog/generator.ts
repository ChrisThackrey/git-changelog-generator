import { nanoid } from 'nanoid';
import { 
  ChangelogEntry, 
  GitOperations, 
  AIReasoning, 
  FilesystemOperations, 
  Change 
} from '../types/index.js';
import { GitOperationsImpl } from '../git/git-operations.js';
import { OpenAIReasoning } from '../ai/openai.js';
import { AnthropicMCP } from '../ai/anthropic.js';
import { FilesystemOperationsImpl } from '../fs/file-operations.js';
import logger, { logOperation } from '../utils/logger.js';

/**
 * Changelog generator main class
 */
export class ChangelogGenerator {
  private gitOps: GitOperations;
  private aiReasoning: AIReasoning;
  private fsOps: FilesystemOperations;
  private anthropicMCP: AnthropicMCP;

  constructor(
    gitOps?: GitOperations,
    aiReasoning?: AIReasoning,
    fsOps?: FilesystemOperations,
    anthropicMCP?: AnthropicMCP
  ) {
    this.gitOps = gitOps || new GitOperationsImpl();
    this.aiReasoning = aiReasoning || new OpenAIReasoning();
    this.fsOps = fsOps || new FilesystemOperationsImpl();
    this.anthropicMCP = anthropicMCP || new AnthropicMCP();
  }

  /**
   * Initialize the changelog directory
   */
  async initialize(): Promise<void> {
    return logOperation('Initialize Changelog Generator', async () => {
      // Ensure we're in a git repository
      const isRepo = await this.gitOps.isGitRepository();
      if (!isRepo) {
        throw new Error('Not a git repository. Please run this command in a git repository.');
      }

      // Ensure changelog directory exists
      const changelogDir = await this.fsOps.ensureChangelogDirectory();
      logger.info(`Changelog directory: ${changelogDir}`);
    });
  }

  /**
   * Generate a changelog for the current staged changes
   */
  async generateChangelog(): Promise<ChangelogEntry | null> {
    return logOperation('Generate Changelog', async () => {
      // Check if we're in a git repository
      const isRepo = await this.gitOps.isGitRepository();
      if (!isRepo) {
        logger.error('Not a git repository. Please run this command in a git repository.');
        return null;
      }

      // Check if there are staged changes
      const hasStagedChanges = await this.gitOps.hasStagedChanges();
      if (!hasStagedChanges) {
        logger.error('No staged changes. Please stage some changes first.');
        return null;
      }

      // Get the staged files
      const stagedFiles = await this.gitOps.getStagedFiles();
      logger.info(`Found ${stagedFiles.length} staged files`);

      // Collect changes
      const changes: Change[] = [];
      for (const file of stagedFiles) {
        const diff = await this.gitOps.getDiff(file);
        
        // Determine the type of change
        let type: Change['type'] = 'modified';
        if (diff.startsWith('new file')) {
          type = 'added';
        } else if (diff.startsWith('deleted')) {
          type = 'deleted';
        } else if (diff.startsWith('renamed')) {
          type = 'renamed';
        }

        changes.push({
          file,
          type,
          description: `Changes to ${file}`,
          diff
        });
      }

      // Get previous changelogs
      const previousChangelogs = await this.fsOps.getPreviousChangelogs();
      
      // Generate initial reasoning with sequential thinking
      const sequentialThinkingResult = await this.anthropicMCP.sequentialThinking(
        changes,
        previousChangelogs
      );

      // Analyze changes with OpenAI
      const { reasoning, relatedChangelogs, categorizedChanges } = await this.aiReasoning.analyzeChanges(
        changes,
        previousChangelogs
      );

      // Get repository insights
      await this.anthropicMCP.getRepositoryInsights();

      // Create timestamp
      const timestamp = new Date().toISOString();
      
      // Generate unique ID
      const id = `changelog-${nanoid(8)}`;

      // Combine categorized changes back into a flat list
      const allCategorizedChanges = categorizedChanges.flatMap(category => 
        category.changes.map(change => ({
          ...change,
          category: category.name
        }))
      );

      // Create changelog entry
      const changelogEntry: ChangelogEntry = {
        id,
        timestamp,
        changes: allCategorizedChanges,
        relatedChangelogs,
        reasoning: `${sequentialThinkingResult}\n\n${reasoning}`
      };

      // Save changelog
      await this.fsOps.saveChangelog(changelogEntry);

      // Store relationships
      await this.anthropicMCP.storeRelationships(
        id,
        previousChangelogs.filter(cl => 
          relatedChangelogs.some(r => r.id === cl.id)
        )
      );

      logger.info(`Generated changelog: ${id}`);

      return changelogEntry;
    });
  }

  /**
   * List previous changelogs
   */
  async listChangelogs(): Promise<ChangelogEntry[]> {
    return logOperation('List Changelogs', async () => {
      const changelogs = await this.fsOps.getPreviousChangelogs();
      logger.info(`Found ${changelogs.length} changelogs`);
      return changelogs;
    });
  }
}
