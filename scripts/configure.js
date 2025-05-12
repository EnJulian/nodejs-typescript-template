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
  setupHusky: true,
  databaseName: `${path.basename(process.cwd())}_dev`
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
    name: 'databaseName',
    message: 'Database name:',
    default: defaultConfig.databaseName
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

// Recursive function to replace template strings in all files
function replaceInAllFiles(dir, replacements) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip node_modules, .git, and dist directories
    if (file === 'node_modules' || file === '.git' || file === 'dist') {
      continue;
    }

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      replaceInAllFiles(filePath, replacements);
    } else {
      // Skip binary files and large files
      if (stat.size > 1024 * 1024 || path.extname(file) === '.png' || 
          path.extname(file) === '.jpg' || path.extname(file) === '.jpeg' || 
          path.extname(file) === '.gif' || path.extname(file) === '.ico' ||
          path.extname(file) === '.woff' || path.extname(file) === '.woff2' ||
          path.extname(file) === '.ttf' || path.extname(file) === '.eot' ||
          path.extname(file) === '.svg') {
        continue;
      }

      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        for (const [search, replace] of replacements) {
          // Check if the content includes the search string (case-insensitive)
          if (content.toLowerCase().includes(search.toLowerCase())) {
            // Create a case-insensitive regular expression for replacement
            content = content.replace(new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), replace);
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, content);
        }
      } catch (error) {
        // Skip files that can't be read as text
        continue;
      }
    }
  }
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
${config.envPrefix}_DATABASE_URL=postgres://postgres:postgres@localhost:5432/${config.databaseName}
${config.envPrefix}_API_VERSION=1.0
${config.envPrefix}_SECRET=your_secret_key
${config.envPrefix}_SALT_ROUNDS=10
`;

  fs.writeFileSync(envExamplePath, envContent);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env and .env.example files');

  // Create database if it doesn't exist
  try {
    const dbName = config.databaseName;
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
    constants = constants.replace(/'APP_'/g, `'${config.envPrefix}_'`);
    constants = constants.replace(/APP_/g, `${config.envPrefix}_`);
    fs.writeFileSync(constantsPath, constants);
    console.log('✅ Updated constants.ts with correct prefix');
  }

  // Update README.md
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf-8');
    // Replace environment variables
    readme = readme.replace(/APP_NODE_ENV/g, `${config.envPrefix}_NODE_ENV`);
    readme = readme.replace(/APP_PORT/g, `${config.envPrefix}_PORT`);
    readme = readme.replace(/APP_DATABASE_URL/g, `${config.envPrefix}_DATABASE_URL`);
    readme = readme.replace(/APP_SECRET/g, `${config.envPrefix}_SECRET`);

    // Replace template name and description
    readme = readme.replace(/Node\.js TypeScript API Template/g, config.projectName);
    readme = readme.replace(/A scalable and modular Node\.js TypeScript API template for quickly bootstrapping new projects\./g, config.projectDescription);
    readme = readme.replace(/\*\*TypeScript\*\* for type safety/g, `**${config.projectName}** with type safety`);

    fs.writeFileSync(readmePath, readme);
    console.log('✅ Updated README.md with project name, description, and correct environment variable names');
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

  // Replace all occurrences of template strings in all files
  console.log('Replacing template strings in all files...');
  const replacements = [
    ['nodejs-typescript-template', config.projectName],
    ['nodejs_typescript_template', config.databaseName],
    ['Node.js TypeScript API Template', config.projectName],
    ['NodeJS TypeScript Template', config.projectName],
    ['TypeScript API Template', config.projectName],
    ['TypeScript Template', config.projectName],
    ['A scalable and modular Node.js TypeScript API template', config.projectDescription],
    ['A NodeJS TypeScript API template', config.projectDescription],
    ['A NodeJS TypeScript API project', config.projectDescription],
    ['TypeScript for type safety', `${config.projectName} with type safety`]
  ];

  // Add a counter to track modified files
  let modifiedFilesCount = 0;

  // Modify the replaceInAllFiles function to log modified files
  const originalReplaceInAllFiles = replaceInAllFiles;
  replaceInAllFiles = function(dir, replacements) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Skip node_modules, .git, and dist directories
      if (file === 'node_modules' || file === '.git' || file === 'dist') {
        continue;
      }

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        replaceInAllFiles(filePath, replacements);
      } else {
        // Skip binary files and large files
        if (stat.size > 1024 * 1024 || path.extname(file) === '.png' || 
            path.extname(file) === '.jpg' || path.extname(file) === '.jpeg' || 
            path.extname(file) === '.gif' || path.extname(file) === '.ico' ||
            path.extname(file) === '.woff' || path.extname(file) === '.woff2' ||
            path.extname(file) === '.ttf' || path.extname(file) === '.eot' ||
            path.extname(file) === '.svg') {
          continue;
        }

        try {
          let content = fs.readFileSync(filePath, 'utf-8');
          let modified = false;

          for (const [search, replace] of replacements) {
            // Check if the content includes the search string (case-insensitive)
            if (content.toLowerCase().includes(search.toLowerCase())) {
              // Create a case-insensitive regular expression for replacement
              content = content.replace(new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), replace);
              modified = true;
            }
          }

          if (modified) {
            fs.writeFileSync(filePath, content);
            modifiedFilesCount++;
            // Log the modified file path (relative to project root)
            const relativePath = path.relative(process.cwd(), filePath);
            console.log(`  Modified: ${relativePath}`);
          }
        } catch (error) {
          // Skip files that can't be read as text
          continue;
        }
      }
    }
  };

  replaceInAllFiles(process.cwd(), replacements);
  console.log(`✅ Replaced template strings in ${modifiedFilesCount} files`);

  console.log('\n🎉 Configuration complete! Your project is ready to use.');
  console.log(`\nTo start development server, run: npm run dev`);
  rl.close();
}

console.log('🚀 Project Configuration\n');
askQuestions(questions); 
