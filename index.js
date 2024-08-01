#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { prompt } from 'enquirer';
import csv from 'csv-parser';

program
  .version('1.0.0')
  .description('My CLI App');

const startMorningPages = async () => {
  let wordCount = 0;
  let content = '';

  console.log(chalk.blue('Start writing your morning pages. You need to write at least 750 words.'));

  process.stdin.on('data', (input) => {
    const words = input.toString().trim().split(/\s+/);
    wordCount += words.length;
    content += input.toString() + '\n';

    console.log(chalk.green(`Current word count: ${wordCount}`));

    if (wordCount >= 750) {
      console.log(chalk.yellow('You have reached 750 words. Do you want to save and exit? (yes/no)'));
      process.stdin.once('data', (answer) => {
        if (answer.toString().trim().toLowerCase() === 'yes') {
          process.stdin.pause();
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `morning-pages-${timestamp}.txt`;
          const filePath = path.join(process.cwd(), filename);

          fs.writeFileSync(filePath, content);
          console.log(chalk.green(`Morning pages saved to ${filePath}`));
        }
      });
    }
  });
};

const startExercise = async () => {
  const { week, random } = await prompt([
    {
      type: 'input',
      name: 'week',
      message: 'Which week do you want to start from? (default: 1)',
      initial: '1'
    },
    {
      type: 'confirm',
      name: 'random',
      message: 'Do you want to do a random exercise?',
      initial: false
    }
  ]);

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

      process.stdin.on('data', (input) => {
        const words = input.toString().trim().split(/\s+/);
        wordCount += words.length;
        content += input.toString() + '\n';

        console.log(chalk.green(`Current word count: ${wordCount}`));

        if (wordCount >= 250) {
          console.log(chalk.yellow('You have reached 250 words. Do you want to save and exit? (yes/no)'));
          process.stdin.once('data', (answer) => {
            if (answer.toString().trim().toLowerCase() === 'yes') {
              process.stdin.pause();
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const filename = `exercise-${exercise.id}-${timestamp}.txt`;
              const filePath = path.join(process.cwd(), filename);

              fs.writeFileSync(filePath, content);
              console.log(chalk.green(`Exercise response saved to ${filePath}`));
            }
          });
        }
      });
    });
};

const main = async () => {
  const { choice } = await prompt({
    type: 'select',
    name: 'choice',
    message: 'What do you want to do?',
    choices: [
      { name: '1', message: 'Morning Pages' },
      { name: '2', message: 'Exercise' }
    ]
  });

  if (choice === '1') {
    await startMorningPages();
  } else if (choice === '2') {
    await startExercise();
  } else {
    console.log(chalk.red('Invalid choice.'));
  }
};

main();

program.parse(process.argv);