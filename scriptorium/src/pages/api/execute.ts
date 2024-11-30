import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import { ErrorResponse } from "@/types/UserTypes";

type LanguageInfo = {
  extension: string;
  image: string;
  compiler: string;
  postCompile?: string;
};

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === "POST") {
    const { code, language, stdin } = req.body;

    try {
      const languageInformation: Record<string, LanguageInfo> = {
        python: { extension: "py", image: "sandbox-python", compiler: "python3" },
        javascript: { extension: "js", image: "sandbox-javascript", compiler: "node" },
        c: { extension: "c", image: "sandbox-c", compiler: "gcc", postCompile: "./a.out" },
        cpp: { extension: "cpp", image: "sandbox-cpp", compiler: "g++", postCompile: "./a.out" },
        java: { extension: "java", image: "sandbox-java", compiler: "javac", postCompile: "java" },
        swift: { extension: "swift", image: "sandbox-swift", compiler: "swiftc", postCompile: "./code" },
        go: { extension: "go", image: "sandbox-go", compiler: "go run" },
        ruby: { extension: "rb", image: "sandbox-ruby", compiler: "ruby" },
        rust: { extension: "rs", image: "sandbox-rust", compiler: "rustc", postCompile: "./code" },
        php: { extension: "php", image: "sandbox-php", compiler: "php" },
      };

      const languageDetails = languageInformation[language?.toLowerCase()];
      if (!code || !languageDetails) {
        return res.status(400).json({ error: "Invalid language or missing code." } as ErrorResponse);
      }

      const tempFolder = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      const tempDir = path.resolve(process.cwd(), "src", "pages", "api", tempFolder);
      await fs.mkdir(tempDir, { recursive: true });

      const { extension, image, compiler, postCompile } = languageDetails;

      let file: string;
      let command: string;
      let javaClass = null;

      if (language.toLowerCase() === "java") {
        const match = code.match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
        if (!match) {
          await fs.rm(tempDir, { recursive: true, force: true });
          return res.status(400).json({ error: "Java code must contain a public class." } as ErrorResponse);
        }
        file = path.join(tempDir, `${match[1]}.${extension}`);
        javaClass = match[1];
      } else {
        file = path.join(tempDir, `code.${extension}`);
      }

      await fs.writeFile(file, code);

      command = javaClass ? `${compiler} '/app/${javaClass}.${extension}'` : `${compiler} '/app/code.${extension}'`;
      if (postCompile) {
        command += ` && ${postCompile}`;
        command += javaClass ? ` ${javaClass}` : ``;
      }

      if (stdin) {
        const stdinFile = path.join(tempDir, "stdin.txt");
        await fs.writeFile(stdinFile, stdin.replace(/\\n/g, "\n"));
        command += ` < '/app/stdin.txt'`;
      }

      const dockerCommand = [
        "docker run",
        "--rm",
        `--volume="${tempDir}":/app`,
        "--workdir=/app",
        "--memory=128m",
        "--cpus=0.5",
        `${image}`,
        "/bin/bash",
        "-c",
        `"timeout 10 ${command}"`,
      ].join(" ");

      exec(dockerCommand, { cwd: tempDir }, async (error, stdout, stderr) => {
        await fs.rm(tempDir, { recursive: true, force: true });

        if (error) {
          if (error.code === 137) {
            return res.status(400).json({
              error: "Execution error: Memory limit exceeded.",
            } as ErrorResponse);
          }
          if (error.code === 124) {
            return res.status(400).json({
              error: "Execution timeout: The code took too long to execute.",
            } as ErrorResponse);
          }
          return res.status(400).json({ error: stderr || error.message } as ErrorResponse);
        }

        return res.status(200).json({ output: stdout, error: stderr });
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error trying to execute the code.",
        details: error.message,
      } as ErrorResponse);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}