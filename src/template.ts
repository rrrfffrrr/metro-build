import fs from 'fs'
import fsPromise from 'fs/promises'
import { IProgram, ProgramTypes } from "./module"

export function checkAndGenerateTemplate(path: string, contents: string) {
    if (fs.existsSync(path)) {
        console.log(`Ignore write template: File already exist: ${path}`)
        return
    }
    return fsPromise.writeFile(path, contents, {
        encoding: 'utf8',
        flag: 'w'
    })
}

export function getProgramTemplate(name: string = 'Hello', type: ProgramTypes = 'executable') : IProgram {
    return {
        name: name,
        type: type,
        dependencies: [],
        targets: {
            Win64: [
                {
                    type: 'source',
                    sources: [ 'src/main.cpp' ],
                    includePath: [ 'include' ],
                    preCommands: [ '# This is source target' ]
                },
                {
                    type: 'include',
                    includePath: [ 'include' ],
                    preCommands: [ '# This is include only target' ]
                },
                {
                    type: 'static',
                    includePath: [ 'hello/include' ],
                    staticLibrary: 'hello/lib/Hello.lib',
                    preCommands: [ '# This is static library target' ]
                },
                {
                    type: 'shared',
                    staticLibrary: 'hello/lib/Hello.lib',
                    sharedLibrary: 'hello/bin/Hello.dll',
                    preCommands: [ '# This is shared library target' ]
                }
            ]
        },
        preCommands: [
            '# pre-commands'
        ],
        postCommands: [
            '# post-commands'
        ]
    }
}

export function getCMakeListsTemplate() {
    return [
        'message(Pre script called)',
        '',
        '#region METRO_BUILD',
        '# Auto generated contents will be replaced in here',
        '#endregion METRO_BUILD',
        '',
        'message(Post script called)'
    ].join('\n')
}