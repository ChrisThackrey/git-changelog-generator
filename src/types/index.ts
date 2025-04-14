/**
 * Represents a single changelog entry
 */
export interface ChangelogEntry {
  id: string;
  timestamp: string;
  changes: Change[];
  relatedChangelogs: RelatedChangelog[];
  reasoning: string;
}

/**
 * Represents a single file change
 */
export interface Change {
  file: string;
  type: 'added' | 'modified' | 'deleted' | 'renamed';
  description: string;
  diff?: string;
}

/**
 * Represents a categorized group of changes
 */
export interface ChangeCategory {
  name: string;
  changes: Change[];
}

/**
 * Represents a relationship to another changelog
 */
export interface RelatedChangelog {
  id: string;
  timestamp: string;
  relationshipType: string;
  relationshipStrength: number;
}

/**
 * Git operations interface
 */
export interface GitOperations {
  isGitRepository(): Promise<boolean>;
  hasStagedChanges(): Promise<boolean>;
  getStagedFiles(): Promise<string[]>;
  getDiff(file: string): Promise<string>;
  getFileContent(file: string, revision?: string): Promise<string>;
}

/**
 * AI reasoning interface
 */
export interface AIReasoning {
  analyzeChanges(
    changes: Change[],
    previousChangelogs: ChangelogEntry[]
  ): Promise<{
    reasoning: string;
    relatedChangelogs: RelatedChangelog[];
    categorizedChanges: ChangeCategory[];
  }>;
}

/**
 * Filesystem operations interface
 */
export interface FilesystemOperations {
  ensureChangelogDirectory(): Promise<string>;
  saveChangelog(entry: ChangelogEntry): Promise<void>;
  getPreviousChangelogs(): Promise<ChangelogEntry[]>;
}

/**
 * Result of reasoning operation
 */
export interface ReasoningResult {
  reasoning: string;
  relatedChangelogs: RelatedChangelog[];
  categorizedChanges: ChangeCategory[];
}

/**
 * CLI options
 */
export interface CLIOptions {
  init?: boolean;
  list?: boolean;
  installHooks?: boolean;
  verbose?: boolean;
}
