# Vireta
> Vite+React+Tailwind (vi-re-ta)

Vireta is a command-line tool for creating Vite + React projects with Tailwind CSS. It provides an easy and convenient way to set up new projects with the necessary dependencies and configurations.

## Features

- Quickly create Vite + React projects with Tailwind CSS.
- Interactive prompts for handling existing project directories.
- Automatic installation of required dependencies.
- Configuration of Tailwind CSS included out of the box.

## Installation

To use Vireta, you need to have Node.js and npm installed on your machine. Then, you can install it globally using npm:

```bash
npm install -g vireta
```

## Usage

Vireta can be used with or without installation via npm. If you have installed Vireta globally, you can use it directly. Alternatively, you can use `npx` to run it without installation:

### With `npm` installation:
```bash
vireta create [project-name]
```

### With `npx`:
```bash
npx vireta create [project-name]
```

If you don't specify a project name, you'll be prompted to enter one.

## Example

Here's an example of creating a new project with Vireta:

```bash
vireta create my-project
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
