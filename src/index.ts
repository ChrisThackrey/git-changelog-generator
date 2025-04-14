#!/usr/bin/env node

import dotenv from 'dotenv';
import { runCLI } from './cli/cli.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Main entry point
function main(): void {
  try {
    // Run the CLI
    runCLI();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Fatal error: ${errorMessage}`);
    process.exit(1);
  }
}

// Run the main function
void main();
