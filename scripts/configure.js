#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default configuration
const defaultConfig = {
  projectName: path.basename(process.cwd()),
  projectDescription: 'A NodeJS TypeScript API project',
  envPrefix: 'APP',
  port: 8080,
  author: '',
  version: '0.0.1',
  license: 'MIT',
  setupGit: true,
  setupHusky: true
};

// Ask for configuration values
const questions = [
  {
    name: 'projectName',
    message: 'Project name:',
    default: defaultConfig.projectName
  },
  {
    name: 'projectDescription',
    message: 'Project description:',
    default: defaultConfig.projectDescription
  },
  {
    name: 'envPrefix',
    message: 'Environment variable prefix (e.g. APP, MY_APP):',
    default: defaultConfig.envPrefix
  },
  {
    name: 'port',
    message: 'Default port:',
    default: defaultConfig.port
  },
  {
    name: 'author',
    message: 'Author:',
    default: defaultConfig.author
  },
  {
    name: 'setupGit',
    message: 'Initialize Git repository? (yes/no)',
    default: 'yes'
  },
  {
    name: 'setupHusky',
    message: 'Set up Husky for Git hooks? (yes/no)',
    default: 'yes'
  }
];

let config = { ...defaultConfig };

function askQuestions(questions, index = 0) {
  if (index >= questions.length) {
    console.log('\nConfiguration summary:');
    console.log(JSON.stringify(config, null, 2));
    rl.question('\nIs this configuration correct? (yes/no) ', (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        applyConfiguration();
      } else {
        console.log('Restarting configuration...');
        config = { ...defaultConfig };
        askQuestions(questions, 0);
      }
    });
    return;
  }

  const question = questions[index];
  rl.question(`${question.message} (${question.default}) `, (answer) => {
    if (answer.trim() === '') {
      config[question.name] = question.default;
    } else {
      if (question.name === 'port') {
        config[question.name] = parseInt(answer, 10);
      } else if (question.name === 'setupGit' || question.name === 'setupHusky') {
        config[question.name] = answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
      } else {
        config[question.name] = answer;
      }
    }
    askQuestions(questions, index + 1);
  });
}

function applyConfiguration() {
  console.log('\nApplying configuration...');

  // Update package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  packageJson.name = config.projectName;
  packageJson.description = config.projectDescription;
  packageJson.version = config.version;
  packageJson.author = config.author;
  packageJson.license = config.license;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');

  // Update .env.example and create .env
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envPath = path.join(process.cwd(), '.env');

  let envContent = `${config.envPrefix}_NODE_ENV=development
${config.envPrefix}_PORT=${config.port}
${config.envPrefix}_DATABASE_URL=postgres://postgres:postgres@localhost:5432/${config.projectName}-dev
${config.envPrefix}_API_VERSION=1.0
${config.envPrefix}_SECRET=your_secret_key
${config.envPrefix}_SALT_ROUNDS=10
`;

  fs.writeFileSync(envExamplePath, envContent);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env and .env.example files');

  // Create database if it doesn't exist
  try {
    const dbName = `${config.projectName}_dev`;
    console.log(`Checking if database "${dbName}" exists...`);

    // Check if database exists
    const checkDbCommand = `psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${dbName}'"`;
    const dbExists = execSync(checkDbCommand, { stdio: 'pipe' }).toString().trim() === '1';

    if (!dbExists) {
      console.log(`Creating database "${dbName}"...`);
      const createDbCommand = `psql -U postgres -c "CREATE DATABASE \\"${dbName}\\""`;
      execSync(createDbCommand, { stdio: 'inherit' });
      console.log(`✅ Created database "${dbName}"`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }
  } catch (error) {
    console.error(`❌ Failed to create database: ${error.message}`);
    console.log('Please create the database manually or ensure PostgreSQL is running.');
  }

  // Update references in code files
  const envUtilsPath = path.join(process.cwd(), 'src', 'shared', 'utils', 'env.ts');
  if (fs.existsSync(envUtilsPath)) {
    let envUtils = fs.readFileSync(envUtilsPath, 'utf-8');
    envUtils = envUtils.replace(/APP_/g, `${config.envPrefix}_`);
    fs.writeFileSync(envUtilsPath, envUtils);
    console.log('✅ Updated environment variable prefix in source files');
  }

  // Update database.json
  const databaseJsonPath = path.join(process.cwd(), 'database.json');
  if (fs.existsSync(databaseJsonPath)) {
    let databaseJson = fs.readFileSync(databaseJsonPath, 'utf-8');
    databaseJson = databaseJson.replace(/APP_DATABASE_URL/g, `${config.envPrefix}_DATABASE_URL`);
    fs.writeFileSync(databaseJsonPath, databaseJson);
    console.log('✅ Updated database.json with correct environment variable prefix');
  }

  // Update constants.ts
  const constantsPath = path.join(process.cwd(), 'src', 'shared', 'constants.ts');
  if (fs.existsSync(constantsPath)) {
    let constants = fs.readFileSync(constantsPath, 'utf-8');
    constants = constants.replace(/APP_PREFIX/g, `${config.envPrefix}_PREFIX`);
    constants = constants.replace(/APP_/g, `${config.envPrefix}_`);
    fs.writeFileSync(constantsPath, constants);
    console.log('✅ Updated constants.ts with correct prefix');
  }

  // Update README.md
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf-8');
    readme = readme.replace(/APP_NODE_ENV/g, `${config.envPrefix}_NODE_ENV`);
    readme = readme.replace(/APP_PORT/g, `${config.envPrefix}_PORT`);
    readme = readme.replace(/APP_DATABASE_URL/g, `${config.envPrefix}_DATABASE_URL`);
    readme = readme.replace(/APP_SECRET/g, `${config.envPrefix}_SECRET`);
    fs.writeFileSync(readmePath, readme);
    console.log('✅ Updated README.md with correct environment variable names');
  }

  // Update test script in package.json
  if (packageJson.scripts && packageJson.scripts.test) {
    packageJson.scripts.test = packageJson.scripts.test
      .replace(/APP_NODE_ENV/g, `${config.envPrefix}_NODE_ENV`)
      .replace(/APP_SECRET/g, `${config.envPrefix}_SECRET`);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated test script in package.json');
  }

  // Initialize Git if requested
  if (config.setupGit) {
    try {
      execSync('git init', { stdio: 'inherit' });
      console.log('✅ Initialized Git repository');
    } catch (error) {
      console.error('❌ Failed to initialize Git repository:', error.message);
    }
  }

  // Setup Husky if requested
  if (config.setupHusky && config.setupGit) {
    try {
      execSync('npm run prepare', { stdio: 'inherit' });
      execSync('npx husky add .husky/pre-commit "npm run lint"', { stdio: 'inherit' });
      console.log('✅ Set up Husky pre-commit hook');
    } catch (error) {
      console.error('❌ Failed to set up Husky:', error.message);
    }
  }

  console.log('\n🎉 Configuration complete! Your project is ready to use.');
  console.log(`\nTo start development server, run: npm run dev`);
  rl.close();
}

console.log('🚀 Project Configuration\n');
askQuestions(questions); 
