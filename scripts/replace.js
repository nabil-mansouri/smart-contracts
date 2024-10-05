const path = require("path");
const fs = require("fs");
const jsonic = require('jsonic')
const globby = require("globby");
const assert = (claim, message) => claim || console.error(message, true);
console.log('=== starting path change ===');
const configName = process.argv.length > 2 ? process.argv[2] : "tsconfig.json";
const configFile = path.resolve(process.cwd(), configName);
assert((0, fs.existsSync)(configFile), `Invalid file path => ${configFile}`);
const config = jsonic(fs.readFileSync(configFile).toString());
const compilerOptions = config.compilerOptions;
const paths = compilerOptions.paths;
const outDir = compilerOptions.outDir;
assert(paths, 'compilerOptions.paths is not set');
assert(outDir, 'compilerOptions.outDir is not set');
const configDir = path.normalize(path.dirname(configFile));
const outPath = path.normalize(configDir + '/' + outDir);

const globPattern = [
    `${outPath}/**/*.{mjs,cjs,js,jsx,d.{mts,cts,ts,tsx}}`
    //`!${outPath}/**/node_modules`
];
const entries = globby.sync(globPattern);

async function replaceOne(entry) {
    let content = originalContent = await fs.promises.readFile(entry, 'utf8');
    for (const alias of Object.keys(paths)) {
        for (const aliasFile of paths[alias]) {
            const absoluteAlias = path.normalize(path.resolve(outPath, aliasFile));
            if (fs.existsSync(absoluteAlias.replace(".ts", ".js"))) {
                const relativise = path.relative(path.dirname(entry), absoluteAlias).replace(".ts", ".js");
                content = content.replace(`"${alias}"`, `"${relativise}"`);
                content = content.replace(`'${alias}''`, `"${relativise}"`);
                if (content != originalContent) {
                    console.log("REPLACE: ", entry, absoluteAlias, relativise)
                }
            } else {
                content = content.replace(`"${alias}"`, `"${aliasFile}"`);
                content = content.replace(`'${alias}''`, `"${aliasFile}"`);
                if (content != originalContent) {
                    console.log("REPLACE: ", entry, alias, aliasFile)
                }
            }
        }
    }
    return { file: entry, content, originalContent }
}

async function replaceAll() {
    const promises = [];
    for (const entry of entries) {
        promises.push(replaceOne(entry))
    }
    const res = await Promise.all(promises)
    for (const r of res) {
        if (r.content !== r.originalContent) {
            await fs.promises.writeFile(r.file, r.content, 'utf8');
            console.log("Path changed: ", r.file)
        }
    }
}

replaceAll().then((all) => {
    console.log("=== finished path change ===")
})
