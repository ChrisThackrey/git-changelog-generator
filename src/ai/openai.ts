import { OpenAI } from 'openai';
import { AIReasoning, Change, ChangelogEntry, ChangeCategory, RelatedChangelog, ReasoningResult } from '../types/index.js';
import logger, { logOperation } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Implementation of AI reasoning using OpenAI
 */
export class OpenAIReasoning implements AIReasoning {
  /**
   * Analyze changes using OpenAI
   */
  async analyzeChanges(
    changes: Change[],
    previousChangelogs: ChangelogEntry[]
  ): Promise<ReasoningResult> {
    return logOperation('OpenAI Reasoning', async () => {
      try {
        logger.info(`Analyzing ${changes.length} changes with ${previousChangelogs.length} previous changelogs`);

        // Prepare the prompt for OpenAI
        const prompt = this.buildPrompt(changes, previousChangelogs);

        // Call OpenAI API
        const response = await openai.chat.completions.create({
          model: 'o3-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that analyzes code changes and identifies patterns and relationships.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        });

        // Parse the response
        const content = response.choices[0]?.message.content;
        
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }

        const result = JSON.parse(content) as {
          reasoning: string;
          relatedChangelogs: RelatedChangelog[];
          categories: { name: string; changes: string[] }[];
        };

        // Map the categories to changes
        const categorizedChanges = this.mapCategoriesToChanges(result.categories, changes);

        logger.info('Successfully analyzed changes with OpenAI');
        
        return {
          reasoning: result.reasoning,
          relatedChangelogs: result.relatedChangelogs,
          categorizedChanges
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`OpenAI reasoning failed: ${errorMessage}`);
        
        // Return default values on error
        return {
          reasoning: 'Failed to analyze changes with OpenAI.',
          relatedChangelogs: [],
          categorizedChanges: [{ name: 'Uncategorized', changes }]
        };
      }
    });
  }

  /**
   * Build the prompt for OpenAI
   */
  private buildPrompt(changes: Change[], previousChangelogs: ChangelogEntry[]): string {
    // Convert changes to a simpler format for the prompt
    const changesForPrompt = changes.map(change => ({
      file: change.file,
      type: change.type,
      diff: change.diff || ''
    }));

    // Convert previous changelogs to a simpler format
    const previousChangelogsForPrompt = previousChangelogs.map(changelog => ({
      id: changelog.id,
      timestamp: changelog.timestamp,
      changes: changelog.changes.map(change => ({
        file: change.file,
        type: change.type,
        description: change.description
      })),
      reasoning: changelog.reasoning
    }));

    // Build the prompt
    return `
      Analyze the following code changes and identify patterns, purposes, and relationships with previous changes.

      Current Changes:
      ${JSON.stringify(changesForPrompt, null, 2)}

      Previous Changelog Entries (${previousChangelogsForPrompt.length}):
      ${JSON.stringify(previousChangelogsForPrompt, null, 2)}

      Please analyze these changes and provide a JSON response with the following structure:
      {
        "reasoning": "Your analysis of the changes, their purpose, and impact",
        "relatedChangelogs": [
          {
            "id": "ID of related changelog",
            "timestamp": "Timestamp of related changelog",
            "relationshipType": "Description of the relationship (e.g. 'Extends', 'Fixes', 'Refactors')",
            "relationshipStrength": "Number from 0 to 1 indicating strength of relationship"
          }
        ],
        "categories": [
          {
            "name": "Name of category (e.g. 'Feature Addition', 'Bug Fix', 'Refactoring')",
            "changes": ["file1.ts", "file2.ts"]
          }
        ]
      }

      Focus on identifying:
      1. The purpose and impact of these changes
      2. How they relate to previous changes
      3. How to categorize them by implementation details
      4. Any patterns or insights that would be useful for future development
    `;
  }

  /**
   * Map category names to actual changes
   */
  private mapCategoriesToChanges(
    categories: { name: string; changes: string[] }[],
    allChanges: Change[]
  ): ChangeCategory[] {
    return categories.map(category => {
      // Find the changes that match the files in this category
      const categoryChanges = allChanges.filter(change => 
        category.changes.includes(change.file)
      );

      return {
        name: category.name,
        changes: categoryChanges
      };
    });
  }
}
