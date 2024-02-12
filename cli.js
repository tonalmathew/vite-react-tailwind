#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { exec } from "child_process";
import inquirer from "inquirer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();
const spinner = ora();

const promptUser = async (message, choices) => {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: message,
      choices: choices,
    },
  ]);
  return action;
};

const executeCommand = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || stdout || error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const checkProjectExists = async (projectName) => {
  const projectPath = path.join(process.cwd(), projectName);
  if (await fs.pathExists(projectPath)) {
    const files = await fs.readdir(projectPath);
    if (files.length > 0) {
      const action = await promptUser(
        `The directory '${projectName}' already exists and is not empty. Please choose how to proceed 👇:`,
        ["Remove existing files and continue", "Change directory name", "Cancel operation"]
      );

      switch (action) {
        case "Remove existing files and continue":
          await fs.emptyDir(projectPath);
          spinner.succeed(`Existing files removed from '${projectName}'.`);
          break;
        case "Change directory name":
          const { newProjectName } = await inquirer.prompt([
            {
              type: "input",
              name: "newProjectName",
              message: "Enter a new project name:",
            },
          ]);
          return checkProjectExists(newProjectName); // Recursively check again with the new project name
        case "Cancel operation":
          spinner.fail("Operation cancelled.");
          process.exit(1);
      }
    }
  }
  return projectName; // Return the original project name if it's valid
};

const createProject = async (projectName) => {
  try {
    const newProjectName = await checkProjectExists(projectName);
    spinner.start(
      `Creating Vite project: ${newProjectName}`
    );

    await executeCommand(
      `npm create vite@latest ${newProjectName} -- --template react`
    );
    spinner.succeed(`Vite project created: ${newProjectName}`);

    spinner.start(`Installing Tailwind dependencies`);
    await executeCommand(
      `npm install -D tailwindcss@latest postcss@latest autoprefixer@latest`,
      { cwd: newProjectName }
    );
    await executeCommand(`npx tailwindcss init -p`, {
      cwd: newProjectName,
    });
    spinner.succeed(`Tailwind dependencies installed`);

    spinner.start(`Configuring project`);
    const projectPath = path.join(process.cwd(), newProjectName);
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

    const projectAppCssPath = path.join(projectPath, "src", "App.css");
    const templateAppCssPath = path.join(templatePath, "App.css");
    const templateAppCssContent = fs.readFileSync(templateAppCssPath, "utf-8");
    fs.appendFileSync(projectAppCssPath, `\n${templateAppCssContent}`);

    const projectAppJsxPath = path.join(projectPath, "src", "App.jsx");
    const templateAppJsxPath = path.join(templatePath, "App.jsx");
    const templateAppJsxContent = fs.readFileSync(templateAppJsxPath, "utf-8");
    fs.writeFileSync(projectAppJsxPath, templateAppJsxContent);

    const projectConfigPath = path.join(projectPath, "tailwind.config.js");
    const templateConfigPath = path.join(templatePath, "tailwind.config.js");
    const templateConfigContent = fs.readFileSync(templateConfigPath, "utf-8");
    fs.writeFileSync(projectConfigPath, templateConfigContent.trim());

    const templateTailwindIconPath = path.join(templatePath, "tailwind.svg");
    const projectTailwindIconPath = path.join(
      projectPath,
      "src",
      "assets",
      "tailwind.svg"
    );
    fs.copyFileSync(templateTailwindIconPath, projectTailwindIconPath);

    spinner.succeed(`Project configured`);
    spinner.succeed(`Project '${newProjectName}' created successfully.`);
    console.log(`\nDone👍, now run:\n`);
    console.log(`  cd ${newProjectName}`);
    console.log(`  npm run dev\n`);
  } catch (error) {
    console.error(`Failed to create project '${projectName}': ${error}`);
  }
};

const promptProjectName = async () => {
  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the project name:",
    },
  ]);
  return projectName;
};

program
  .command("create [project-name]")
  .description("Create a new Vite + React project with Tailwind CSS")
  .action(async (projectName) => {
    if (!projectName) {
      projectName = await promptProjectName();
    }
    createProject(projectName);
  });

program.parse(process.argv);
