#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import csv from 'csv-parser';

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
        console.log(chalk.yellow('You have reached 750 words. Do you want to save and exit? (yes/no)'));
        rl.question('', (answer) => {
          if (answer.toLowerCase() === 'yes') {
            rl.close();
          }
        });
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

program
  .command('exercise')
  .description('Start an exercise')
  .option('-r, --random', 'Do a random exercise')
  .option('-w, --week <number>', 'Specify the week', '1')
  .action((options) => {
    const exercises = [];
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', (row) => {
        exercises.push(row);
      })
      .on('end', () => {
        let exercise;
        if (options.random) {
          const weekExercises = exercises.filter(ex => ex.week === options.week);
          exercise = weekExercises[Math.floor(Math.random() * weekExercises.length)];
        } else {
          exercise = exercises.find(ex => ex.week === options.week && ex.order === '1');
        }

        if (!exercise) {
          console.log(chalk.red('No exercise found for the specified week.'));
          return;
        }

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: true
        });

        let wordCount = 0;
        let content = `${exercise.id} - ${exercise.name}\n\n${exercise.description}\n\n`;

        console.log(chalk.blue(`Exercise: ${exercise.name}`));
        console.log(chalk.blue(exercise.description));
        console.log(chalk.blue('Start writing your response. You need to write at least 250 words.'));

        rl.on('line', (input) => {
          const words = input.trim().split(/\s+/);
          wordCount += words.length;
          content += input + '\n';

          if (wordCount >= 250) {
            console.log(chalk.yellow('You have reached 250 words. Do you want to save and exit? (yes/no)'));
            rl.question('', (answer) => {
              if (answer.toLowerCase() === 'yes') {
                rl.close();
              }
            });
          }
        });

        rl.on('close', () => {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `exercise-${exercise.id}-${timestamp}.txt`;
          const filePath = path.join(process.cwd(), filename);

          fs.writeFileSync(filePath, content);
          console.log(chalk.green(`Exercise response saved to ${filePath}`));
        });
      });
  });

program.parse(process.argv);