#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';

program
  .version('1.0.0')
  .description('My CLI App');

program
  .command('greet <name>')
  .description('Greet a person')
  .action((name) => {
    console.log(chalk.green(`Hello, ${name}!`));
  });

program.parse(process.argv);
