import { spawn } from "child_process"
import fs from 'fs/promises'
import { pathEqual } from 'path-equal'

export interface IExecuteResult {
    stdout: string,
    stderr: string
}

export async function dispatchContents(cmakePath: string, contents: string, template?: string) {
    if (!template) {
        template = await fs.readFile(cmakePath, { encoding: 'utf8' })
    }
    let regex = /(?<=(^|\n)#region\s+METRO_BUILD\s*\n)((.|\n)*)(?=\n#endregion\s+METRO_BUILD\s*($|\n))/g
    return await fs.writeFile(cmakePath, template.replace(regex, contents), { encoding: 'utf8', flag: 'w' })
}

export function generateProject(sourcePath: string, buildPath: string) {
    if (pathEqual(sourcePath, buildPath))
        throw new Error(`Prevent to generate in-tree build: ${sourcePath} -> ${buildPath}`)
    return new Promise<number | null>((res, rej) => {
        let cmake = spawn('cmake', ['-S', sourcePath, '-B', buildPath])
        cmake.stdout.on('data', data => console.log(data.toString()))
        cmake.stderr.on('data', data => console.log(data.toString()))
        cmake.on('exit', code => res(code))
    })
}

export function buildProject(buildPath: string) {
    return new Promise<number | null>((res, rej) => {
        let cmake = spawn('cmake', ['--build', buildPath])
        cmake.stdout.on('data', data => console.log(data.toString()))
        cmake.stderr.on('data', data => console.log(data.toString()))
        cmake.on('exit', code => res(code))
    })
}