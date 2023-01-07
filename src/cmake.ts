import { exec } from "child_process"
import fs from 'fs/promises'

export interface IExecuteResult {
    stdout: string,
    stderr: string
}

export async function dispatchContents(cmakePath: string, contents: string) {
    let template = await fs.readFile(cmakePath, { encoding: 'utf8' })
    let regex = /(?<=(^|\n)#region\s+METRO_BUILD\s*\n)((.|\n)*)(?=\n#endregion\s+METRO_BUILD\s*($|\n))/g
    return await fs.writeFile(cmakePath, template.replace(regex, contents), { encoding: 'utf8', flag: 'w' })
}

export function generateProject(sourcePath: string, buildPath: string) {
    return new Promise<IExecuteResult>((res, rej) => {
        exec(`cmake -S \"${sourcePath}\" -B \"${buildPath}\"`, (err, stdout, stderr) => {
            if (err) {
                rej(err)
                return;
            }
            res({
                stdout,
                stderr
            })
        })
    })
}

export function buildProject(buildPath: string) {
    return new Promise<IExecuteResult>((res, rej) => {
        exec(`cmake --build \"${buildPath}\"`, (err, stdout, stderr) => {
            if (err) {
                rej(err)
                return;
            }

            res({
                stdout,
                stderr
            })
        })
    })
}