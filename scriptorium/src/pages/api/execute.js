import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { code, language, stdin } = req.body;

    try {
      const languageInformation = {
        python: { extension: "py", complier: "python3" },
        javascript: { extension: "js", complier: "node" },
        c: { extension: "c", complier: "gcc"},
        cpp: { extension: "cpp", complier: "g++" },
        java: { extension: "java", complier: "javac"},
      };

      if (!code || !language || !languageInformation[language]) {
        return res.status(400).json({error: "Invalid language or missing code.",});
      }
      const compiledLanguages = ["c", "cpp", "java"];

      const tempDir = path.resolve(process.cwd(), 'src', 'pages', 'api', 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      const { extension, complier } = languageInformation[language];

      let file, javaClass = null;
      let command = `echo "${stdin}" | `;

      if (language.toLowerCase() === "java") {
        const match = code.match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
        if (!match) {
          return res.status(400).json({ error: "Java code must contain a public class." });
        }
        file = path.join(tempDir, `${match[1]}.${extension}`);
        javaClass = match[1];
      }
      else {
        file = path.join(tempDir, `code.${extension}`);
      }

      await fs.writeFile(file, code);
      command += `${complier} "${file}"`;

      if (compiledLanguages.indexOf(language.toLowerCase()) > -1) {
        command += ` && cd "${tempDir}" && `;
        command += javaClass ? `java ${javaClass}` : `./a.out`;
      }

      // command = command.replace(/\\/g, '/');

      exec(command, (error, stdout, stderr) => {
        fs.rm(tempDir, { recursive: true, force: true })

        if (error) {
          return res.status(500).json({ error: "Execution error", details: stderr || error.message });
        }

        return res.status(200).json({ output: stdout, error: stderr });
      });
    } catch (error) {
      return res.status(500).json({ error: "Error trying to execute the code", details: error.message });
    }
  }
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
  