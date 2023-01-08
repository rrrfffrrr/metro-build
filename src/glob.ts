import { sync as globSync } from 'glob'

function replaceBackSlash2Slash(path: string) {
    return path.replace(/\\+/g, '/');
}

export function resolveFiles(search: string) {
    return globSync(replaceBackSlash2Slash(search))
}