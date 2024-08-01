#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import csv from 'csv-parser';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

program
  .version('1.0.0')
  .description('My CLI App');

const askQuestion = (question) => {
  return new Promise((resolve) => rl.question(question, resolve));
};

const startMorningPages = async () => {
  let wordCount = 0;
  let content = '';

  console.log(chalk.blue('Start writing your morning pages. You need to write at least 750 words.'));

  rl.on('line', (input) => {
    const words = input.trim().split(/\s+/);
    wordCount += words.length;
    content += input + '\n';

    console.log(chalk.green(`Current word count: ${wordCount}`));

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
};

const startExercise = async () => {
  const week = await askQuestion('Which week do you want to start from? (default: 1) ') || '1';
  const random = await askQuestion('Do you want to do a random exercise? (yes/no) ') === 'yes';

  const exercises = [];
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
      exercises.push(row);
    })
    .on('end', () => {
      let exercise;
      if (random) {
        const weekExercises = exercises.filter(ex => ex.Week === week);
        exercise = weekExercises[Math.floor(Math.random() * weekExercises.length)];
      } else {
        exercise = exercises.find(ex => ex.Week === week && ex.id === '1');
      }

      if (!exercise) {
        console.log(chalk.red('No exercise found for the specified week.'));
        return;
      }

      let wordCount = 0;
      let content = `${exercise.id} - ${exercise.Activity}\n\n${exercise.Description}\n\n`;

      console.log(chalk.blue(`Exercise: ${exercise.Activity}`));
      console.log(chalk.blue(exercise.Description));
      console.log(chalk.blue('Start writing your response. You need to write at least 250 words.'));

      rl.on('line', (input) => {
        const words = input.trim().split(/\s+/);
        wordCount += words.length;
        content += input + '\n';

        console.log(chalk.green(`Current word count: ${wordCount}`));

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
};

const main = async () => {
  const choice = await askQuestion('What do you want to do? (1: Morning Pages, 2: Exercise) ');

  if (choice === '1') {
    await startMorningPages();
  } else if (choice === '2') {
    await startExercise();
  } else {
    console.log(chalk.red('Invalid choice.'));
    rl.close();
  }
};

main();

program.parse(process.argv);