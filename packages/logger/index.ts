import chalk from "chalk";

export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.red("ERROR >", ...args));
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow("WARN >", ...args));
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan("INFO >", ...args));
  },
  success(...args: unknown[]) {
    console.log(chalk.green("SUCCESS >", ...args));
  },
  break() {
    console.log("");
  },
};
