import * as dotenv from "dotenv";
import { promises as fsPromises } from "fs";
import path from "path";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkFindReplace from "./remarkFindReplace.mjs";

const env = dotenv.parse(
  await fsPromises.readFile(path.resolve(process.cwd(), ".env"))
);

export const toMdAST = await unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkFindReplace, {
    replacements: { ...env, PLACEHOLDER: "derpy-do" },
    prefix: "%",
  });
