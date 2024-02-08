#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

function executeCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || stdout || error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function createProject(projectName) {
  const spinner = ora();

  try {
    spinner.start(`Creating Vite project: ${projectName}`);
    await executeCommand(
      `npm create vite@latest ${projectName} -- --template react`
    );
    spinner.succeed(`Vite project created: ${projectName}`);

    spinner.start(`Installing Tailwind dependencies`);
    await executeCommand(
      `npm install -D tailwindcss@latest postcss@latest autoprefixer@latest`,
      { cwd: projectName }
    );
    await executeCommand(`npx tailwindcss init -p`, { cwd: projectName });
    spinner.succeed(`Tailwind dependencies installed`);

    spinner.start(`Configuring project`);
    const projectPath = path.join(process.cwd(), projectName);
    const templatePath = path.join(__dirname, "template");

    const projectIndexCssPath = path.join(projectPath, "src", "index.css");
    let existingIndexCssContent = "";
    if (fs.existsSync(projectIndexCssPath)) {
      existingIndexCssContent = fs.readFileSync(projectIndexCssPath, "utf-8");
    }
    const tailwindImports =
      "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n";
    fs.writeFileSync(
      projectIndexCssPath,
      tailwindImports + existingIndexCssContent
    );
    spinner.succeed(`Project configured`);

    spinner.start(`Updating App.css`);
    const projectAppCssPath = path.join(projectPath, "src", "App.css");
    const templateAppCssPath = path.join(templatePath, "App.css");
    const templateAppCssContent = fs.readFileSync(templateAppCssPath, "utf-8");
    fs.appendFileSync(projectAppCssPath, `\n${templateAppCssContent}`);
    spinner.succeed(`App.css updated`);

    spinner.start(`Updating App.jsx`);
    const projectAppJsxPath = path.join(projectPath, "src", "App.jsx");
    const templateAppJsxPath = path.join(templatePath, "App.jsx");
    const templateAppJsxContent = fs.readFileSync(templateAppJsxPath, "utf-8");
    fs.writeFileSync(projectAppJsxPath, templateAppJsxContent);
    spinner.succeed(`App.jsx updated`);

    spinner.start(`Updating tailwind.config.js`);
    const projectConfigPath = path.join(projectPath, "tailwind.config.js");
    const templateConfigPath = path.join(templatePath, "tailwind.config.js");
    const templateConfigContent = fs.readFileSync(templateConfigPath, "utf-8");
    fs.writeFileSync(projectConfigPath, templateConfigContent.trim());
    spinner.succeed(`tailwind.config.js updated`);

    spinner.start(`Adding Tailwind SVG`);
    const templateTailwindIconPath = path.join(templatePath, "tailwind.svg");
    const projectTailwindIconPath = path.join(
      projectPath,
      "src",
      "assets",
      "tailwind.svg"
    );
    fs.copyFileSync(templateTailwindIconPath, projectTailwindIconPath);
    spinner.succeed(`Tailwind SVG added`);

    spinner.succeed(`Project '${projectName}' created successfully.`);
    console.log(`\nDone👍, now run:\n`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm run dev\n`);
  } catch (error) {
    spinner.fail(`Failed to create project '${projectName}': ${error}`);
  }
}

program
  .command("create <project-name>")
  .description("Create a new Vite + React project with Tailwind CSS")
  .action(createProject);

program.parse(process.argv);
