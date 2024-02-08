#!/usr/bin/env node

const { program } = require("commander");
const { exec } = require("shelljs");
const fs = require("fs-extra");
const path = require("path");

program
  .command("create <project-name>")
  .description("Create a new Vite + React project with Tailwind CSS")
  .action((projectName) => {
    console.log(
      `Creating Vite + React project with Tailwind CSS: ${projectName}`
    );
    exec(`npm init vite@latest ${projectName} -- --template react`);
    exec(
      `cd ${projectName} && npm install -D tailwindcss@latest postcss@latest autoprefixer@latest`
    );
    exec(`cd ${projectName} && npx tailwindcss init -p`);

    // project and template folder path
    const projectPath = path.join(process.cwd(), projectName);
    const templatePath = path.join(__dirname, "template");

    // Read existing content of index.css and update with tailwind imports
    const projectIndexCssPath = path.join(projectPath, "src", "index.css");
    let existingIndexCssContent = "";
    if (fs.existsSync(projectIndexCssPath)) {
      existingIndexCssContent = fs.readFileSync(projectIndexCssPath, "utf-8");
    }
    const tailwindImports = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n`;
    fs.writeFileSync(projectIndexCssPath, tailwindImports + existingIndexCssContent);

    // update app.css file
    const projectAppCssPath = path.join(projectPath, "src", "App.css");
    const templateAppCssPath = path.join(templatePath, "App.css");
    const templateAppCssContent = fs.readFileSync(templateAppCssPath, "utf-8");
    fs.appendFileSync(projectAppCssPath, `\n${templateAppCssContent}`);

    // Update tailwind.config.js
    const projectConfigPath = path.join(projectPath, "tailwind.config.js")
    const templateConfigPath = path.join(templatePath, "tailwind.config.js")
    const templateConfigContent = fs.readFileSync(templateConfigPath, "utf-8")
    fs.writeFileSync(projectConfigPath, templateConfigContent.trim());

    // write to App.jsx
    const projectAppJsxPath = path.join(projectPath, "src", "App.jsx")
    const templateAppJsxPath = path.join(templatePath, "App.jsx")
    const templateAppJsxContent = fs.readFileSync(templateAppJsxPath, "utf-8")
    fs.writeFileSync(projectAppJsxPath, templateAppJsxContent.trim());

    // Copy Tailwind SVG icon to the assets folder
    const templateTailwindIconPath = path.join(templatePath, "tailwind.svg");
    const projectTailwindIconPath = path.join(projectPath, "src", "assets", "tailwind.svg")
    fs.copyFileSync(templateTailwindIconPath, projectTailwindIconPath);

    console.log(`Project '${projectName}' created successfully.`);
  });

program.parse(process.argv);
