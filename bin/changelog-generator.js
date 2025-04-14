#!/usr/bin/env node

// This file is a simple wrapper for the compiled TypeScript
import('../dist/index.js').catch(err => {
  console.error('Failed to start changelog generator:', err);
  process.exit(1);
});
