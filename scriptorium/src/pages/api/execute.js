import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { code, language, stdin } = req.body;

    try {
      const languageInformation = {
        python: { extension: "py", image: 'sandbox-python', compiler: "python3" },
        javascript: { extension: "js", image: 'sandbox-javascript', compiler: "node" },
        c: { extension: "c", image: 'sandbox-c', compiler: "gcc", postCompile: "./a.out" },
        cpp: { extension: "cpp", image: 'sandbox-cpp', compiler: "g++", postCompile: "./a.out" },
        java: { extension: "java", image: 'sandbox-java', compiler: "javac", postCompile: "java" },
        swift: { extension: "swift", image: 'sandbox-swift', compiler: "swiftc", postCompile: "./code" },
        go: { extension: "go", image: 'sandbox-go', compiler: "go run" },
        ruby: { extension: "rb", image: 'sandbox-ruby', compiler: "ruby" },
        rust: { extension: "rs", image: 'sandbox-rust', compiler: "rustc", postCompile: "./code" },
        php: { extension: "php", image: 'sandbox-php', compiler: "php" },
      };

      if (!code || !language || !languageInformation[language.toLowerCase()]) {
        return res.status(400).json({error: "Invalid language or missing code.",});
      }
      const compiledLanguages = ["c", "cpp", "java", "swift", "go", "rust"];

      const tempFolder = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      const tempDir = path.resolve(process.cwd(), 'src', 'pages', 'api', tempFolder);
      await fs.mkdir(tempDir, { recursive: true });
      const { extension, image, compiler, postCompile } = languageInformation[language];

      let file, command, javaClass = null;

      if (language.toLowerCase() === "java") {
        const match = code.match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
        if (!match) {
          fs.rm(tempDir, { recursive: true, force: true });
          return res.status(400).json({ error: "Java code must contain a public class." });
        }
        file = path.join(tempDir, `${match[1]}.${extension}`);
        javaClass = match[1];
      } else {
        file = path.join(tempDir, `code.${extension}`);
      }

      await fs.writeFile(file, code);
      command = javaClass ? `${compiler} '/app/${javaClass}.${extension}'` : `${compiler} '/app/code.${extension}'`;

      if (postCompile) {
        // command += ` && cd 'app/' && `;
        command += ` && ${postCompile}`
        command += javaClass ? ` ${javaClass}` : ``;
      }

      if (stdin) {
        const formattedStdin = stdin.replace(/\\n/g, '\n');
        const stdinFile = path.join(tempDir, 'stdin.txt');
        await fs.writeFile(stdinFile, formattedStdin);
        command += ` < '/app/stdin.txt'`;
      }

      if (process.platform === "win32") {
        command = command.replace(/\\/g, '/');
        // command = command.replace(/([A-Za-z]):\//g, (match, drive) => `/mnt/${drive.toLowerCase()}/`);
        // command = `wsl bash -c "${command}"`;
      }

      const dockerCommand = [
        'docker run',
        '--rm',
        `--volume="${tempDir}":/app`,
        `--workdir=/app`,
        `--memory=128m`,
        `--cpus=0.5`,
        `${image}`,
        '/bin/bash',
        '-c',
        `"timeout 10 ${command}"`,
      ].join(' ');

      exec(dockerCommand, { cwd: tempDir }, (error, stdout, stderr) => {
        const cleanup = async () => {
          try {
            await fs.rm(tempDir, { recursive: true, force: true });
          } catch (cleanupError) {
            console.error("Error cleaning up temp directory:", cleanupError);
          }
        };

        if (error) {
          if (error.code === 137) {
            cleanup();
            return res.status(400).json({
              error: "Execution error: ", details: "Memory limit exceeded."
            });
          }

          if (error.code === 124) {
            cleanup();
            return res.status(400).json({
              error: "Execution timeout: ", details: "The code took too long to execute."
            });
          }

          cleanup();
          return res.status(400).json({ error: "Execution error: ", details: stderr || error.message });
        }

        cleanup();

        return res.status(200).json({ output: stdout, error: stderr });
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error trying to execute the code: ", details: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
  