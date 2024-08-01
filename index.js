#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

program
  .version('1.0.0')
  .description('My CLI App');

program
  .command('greet <name>')
  .description('Greet a person')
  .action((name) => {
    console.log(chalk.green(`Hello, ${name}!`));
  });

program
  .command('morning-pages')
  .description('Start writing your morning pages')
  .action(() => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    let wordCount = 0;
    let content = '';

    console.log(chalk.blue('Start writing your morning pages. You need to write at least 750 words.'));

    rl.on('line', (input) => {
      const words = input.trim().split(/\s+/);
      wordCount += words.length;
      content += input + '\n';

      if (wordCount >= 750) {
        rl.close();
      }
    });

    rl.on('close', () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `morning-pages-${timestamp}.txt`;
      const filePath = path.join(process.cwd(), filename);

      fs.writeFileSync(filePath, content);
      console.log(chalk.green(`Morning pages saved to ${filePath}`));
    });
  });

program.parse(process.argv);