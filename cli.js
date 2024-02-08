import { Command } from 'commander';
import pkg from 'shelljs';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { exec } = pkg

const program = new Command();

function createProject(projectName) {
  const initViteSpinner = ora(`Initializing Vite project: ${projectName}`).start();
  try {
    exec(`npm create vite@latest ${projectName} -- --template react`);
    initViteSpinner.succeed(`Vite project initialized: ${projectName}`);

    const spinner = ora(`Installing Tailwind dependencies and configuring project: ${projectName}`).start();
    exec(`cd ${projectName} && npm install -D tailwindcss@latest postcss@latest autoprefixer@latest`);
    exec(`cd ${projectName} && npx tailwindcss init -p`);

    const projectPath = path.join(process.cwd(), projectName);
    const templatePath = path.join(__dirname, 'template');

    // Update index.css with tailwind imports
    const projectIndexCssPath = path.join(projectPath, 'src', 'index.css');
    let existingIndexCssContent = '';
    if (fs.existsSync(projectIndexCssPath)) {
      existingIndexCssContent = fs.readFileSync(projectIndexCssPath, 'utf-8');
    }
    const tailwindImports = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n';
    fs.writeFileSync(projectIndexCssPath, tailwindImports + existingIndexCssContent);

    // Append content of App.css from template to new project's App.css
    const projectAppCssPath = path.join(projectPath, 'src', 'App.css');
    const templateAppCssPath = path.join(templatePath, 'App.css');
    const templateAppCssContent = fs.readFileSync(templateAppCssPath, 'utf-8');
    fs.appendFileSync(projectAppCssPath, `\n${templateAppCssContent}`);

    // Update tailwind.config.js
    const projectConfigPath = path.join(projectPath, 'tailwind.config.js');
    const templateConfigPath = path.join(templatePath, 'tailwind.config.js');
    const templateConfigContent = fs.readFileSync(templateConfigPath, 'utf-8');
    fs.writeFileSync(projectConfigPath, templateConfigContent.trim());

    // Copy Tailwind SVG icon to the assets folder
    const templateTailwindIconPath = path.join(templatePath, 'tailwind.svg');
    const projectTailwindIconPath = path.join(projectPath, 'src', 'assets', 'tailwind.svg');
    fs.copyFileSync(templateTailwindIconPath, projectTailwindIconPath);
    spinner.succeed(`Project '${projectName}' created successfully.`);
  } catch (error) {
    spinner.fail(`Failed to create project '${projectName}': ${error.message}`);
  }
}

program
  .command('create <project-name>')
  .description('Create a new Vite + React project with Tailwind CSS')
  .action(createProject);

program.parse(process.argv);
