//Piston API is a service for the code execution

const PISTON_API = "https://emkc.org/api/v2/piston";

const LANGUAGE_VERSIONS = {
     javascript:{language:"javascript",version:"18.0.0"},
     python:{language:"python",version:"3.12.0"},
     java:{language:"java",version:"17.0.2"},
}

/**
 * @param {string} language - programming language
 * @param {string} code - sourcode code to execute
 * @returns {Promise<{sucess: boolean, output?: string, error?: string}>} - result of code execution
 */
export async function executeCode(language, code) {
    try {
     const languageConfig = LANGUAGE_VERSIONS[language];

        if (!languageConfig) {
            return {
            sucess: false,
            error:`Unsupported language: ${language}`
        };
    }

    const response = await fetch(`${PISTON_API}/execute`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            language: languageConfig.language,
            version: languageConfig.version,
            files: [
                {
                    name: `main.${getFileExtension(language)}`,
                    content: code
                },
            ],
        }),
    });

    if (!response.ok) {
        return {
            sucess: false,
            error: `HTTP error! status: ${response.status}`
        };
    }

    const data = await response.json();

    const output = data.run.output || "";
    const stderr = data.run.stderr || "";

    if (stderr) {
        return {
            sucess: false,
            output: output,
            error: stderr
        };
    }

    return {
        sucess: true,
        output: output || " No output "
    };


  } catch (error) {
    return {
        sucess: false,
        error: `Error executing code: ${error.message}`,
    };

  }
}

function getFileExtension(language) {
    const extensions = {
        javascript: "js",
        python: "py",
        java: "java"
    };
    return extensions[language] || "txt";
}