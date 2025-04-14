import { Command } from 'commander';
import { CLIOptions } from '../types/index.js';
import { ChangelogGenerator } from '../changelog/generator.js';
import logger from '../utils/logger.js';

/**
 * Configure and run the CLI
 */
export function runCLI(): void {
  const program = new Command();

  program
    .name('changelog-generator')
    .description('AI-powered changelog generator for Git repositories')
    .version('1.0.0');

  program
    .option('-i, --init', 'Initialize changelog directory')
    .option('-l, --list', 'List previous changelogs')
    .option('--install-hooks', 'Install Git hooks')
    .option('-v, --verbose', 'Enable verbose logging');

  program.parse(process.argv);

  const options = program.opts<CLIOptions>();

  // Set log level based on verbose flag
  if (options.verbose) {
    logger.level = 'debug';
  }

  handleOptions(options).catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error: ${errorMessage}`);
    process.exit(1);
  });
}

/**
 * Handle CLI options
 */
async function handleOptions(options: CLIOptions): Promise<void> {
  const generator = new ChangelogGenerator();

  if (options.init) {
    // Initialize changelog directory
    logger.info('Initializing changelog directory');
    await generator.initialize();
    logger.info('Changelog directory initialized successfully');
  } else if (options.list) {
    // List previous changelogs
    logger.info('Listing previous changelogs');
    const changelogs = await generator.listChangelogs();
    if (changelogs.length === 0) {
      logger.info('No changelogs found');
    } else {
      logger.info(`Found ${changelogs.length} changelogs:`);
      for (const changelog of changelogs) {
        logger.info(`- ${changelog.id} (${changelog.timestamp})`);
      }
    }
  } else if (options.installHooks) {
    // Install git hooks
    logger.info('Installing Git hooks');
    await installGitHooks();
    logger.info('Git hooks installed successfully');
  } else {
    // Generate changelog
    logger.info('Generating changelog');
    const changelog = await generator.generateChangelog();
    if (changelog) {
      logger.info(`Changelog generated successfully: ${changelog.id}`);
    }
  }
}

/**
 * Install Git hooks
 */
async function installGitHooks(): Promise<void> {
  const { installGitHooks } = await import('../cli/install-hooks.js');
  await installGitHooks();
}
