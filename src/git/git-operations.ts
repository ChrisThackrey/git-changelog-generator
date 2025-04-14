import { GitOperations } from '../types/index.js';
import logger, { logOperation } from '../utils/logger.js';
import { simpleGit, SimpleGit } from 'simple-git';

/**
 * Implementation of git operations using simple-git
 */
export class GitOperationsImpl implements GitOperations {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit().cwd(process.cwd());
  }

  /**
   * Check if the current directory is a git repository
   */
  async isGitRepository(): Promise<boolean> {
    return logOperation('Check Git Repository', async () => {
      try {
        await this.git.revparse(['--is-inside-work-tree']);
        logger.info('Valid Git repository detected');
        return true;
      } catch {
        logger.error('Failed to check Git repository');
        return false;
      }
    });
  }

  /**
   * Check if there are staged changes
   */
  async hasStagedChanges(): Promise<boolean> {
    return logOperation('Check Staged Changes', async () => {
      try {
        const status = await this.git.status();
        const hasStagedChanges = status.staged.length > 0;
        logger.info(`Staged changes check: ${hasStagedChanges ? 'Has changes' : 'No changes'}`);
        return hasStagedChanges;
      } catch {
        logger.error('Failed to check staged changes');
        return false;
      }
    });
  }

  /**
   * Get list of staged files
   */
  async getStagedFiles(): Promise<string[]> {
    return logOperation('Get Staged Files', async () => {
      try {
        const status = await this.git.status();
        const files = status.staged;
        logger.info(`Found ${files.length} staged files`);
        return files;
      } catch {
        logger.error('Failed to get staged files');
        return [];
      }
    });
  }

  /**
   * Get diff for a specific file
   */
  async getDiff(file: string): Promise<string> {
    return logOperation(`Get Diff: ${file}`, async () => {
      try {
        // Get the staged diff for the file
        const diff = await this.git.diff(['--cached', file]);
        return diff;
      } catch {
        logger.error(`Failed to get diff for file: ${file}`);
        return '';
      }
    });
  }

  /**
   * Get content of a file
   */
  async getFileContent(file: string, revision: string = 'HEAD'): Promise<string> {
    return logOperation(`Get File Content: ${file} (${revision})`, async () => {
      try {
        if (revision === 'HEAD') {
          // For HEAD, use the show command
          const content = await this.git.show([`${revision}:${file}`]);
          return content;
        } else {
          // For other revisions
          const content = await this.git.show([`${revision}:${file}`]);
          return content;
        }
      } catch {
        logger.error(`Failed to get content for file: ${file}`);
        return '';
      }
    });
  }
}
