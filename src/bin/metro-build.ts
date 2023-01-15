#!/usr/bin/env node

import { cwd } from 'process'
import { program, Option, Command } from 'commander'
import path from 'path'
import fs from 'fs'
import { checkAndGenerateTemplate, getCMakeListsTemplate, getProgramTemplate } from '../template'
import { parse } from '../generate'
import { dispatchContents, generateProject, buildProject } from '../cmake'
import { getPreventInSourceBuildCommand } from '../utility'
import { IProgram, ProgramTypes } from '../defines'
import { resolveFiles } from '../glob'
import Builder from '../generate/builder'

const LIB_NAME = 'MetroBuild.json'

program
    .addCommand(new Command('init')
        .addOption(new Option('-S, --source <path>', `Path to ${LIB_NAME}`)
            .default(cwd(), 'Current working directory')
        )
        .addOption(new Option('--name <name>', 'Set name of executable(library)')
            .default('Hello')
        )
        .addOption(new Option('-T, --type <type>', 'Whether executable or library')
            .default('executable')
            .choices(ProgramTypes)
        )
        .addOption(new Option('-P, --prevent-in-source-build', 'Add helper commands to prevent \"cmake -S . -B .\"')
        )
        .action((options) => {
            const libPath = path.join(<string>options.source, LIB_NAME)
            checkAndGenerateTemplate(libPath, JSON.stringify(getProgramTemplate(options.name, options.type), null, 4))
            const cmakePath = path.join(<string>options.source, 'CMakeLists.txt')
            checkAndGenerateTemplate(cmakePath, `${options.preventInSourceBuild ? [...getPreventInSourceBuildCommand(), '', ''].join('\n') : ''}${getCMakeListsTemplate()}`)
        })
    )
    .addCommand(new Command('generate')
        .addOption(new Option('-S, --source <path>', `Path to ${LIB_NAME}`)
            .default(cwd(), 'Current working directory')
        )
        .addOption(new Option('-R, --recursive', 'Also generating sub-dirs')
        )
        .addOption(new Option('-G, --generate-project', 'Run \"cmake -S . -B build\"')
        )
        .addOption(new Option('-B, --build-project', 'Run \"cmake --build build\"')
        )
        .action((options) => {
            const libPath = (<string>options.source).endsWith(LIB_NAME) ? <string>options.source : path.join(options.source, LIB_NAME)
            const files = (options.recursive)
                ? resolveFiles(path.join(path.dirname(libPath), '**', LIB_NAME))
                : [libPath]
            const promise = files.map(async filePath => {
                    let data : IProgram = (await import(filePath)).default
                    const cmakePath = path.join(path.dirname(filePath), 'CMakeLists.txt')
                    if (!fs.existsSync(cmakePath)) {
                        console.log(`No CMakeLists.txt found, generate one: ${cmakePath}`)
                        checkAndGenerateTemplate(cmakePath, getCMakeListsTemplate())
                    }
                    let rootNode = parse(data)
                    let builder = new Builder(data.name)
                    rootNode.build(builder)
                    dispatchContents(cmakePath, ['# AUTO GENERATED', ...builder.result].join('\n'))
                })
            Promise.all(promise).then(async () => {
                if (options.generateProject) {
                    await generateProject('.', 'build')
                }
                if (options.buildProject) {
                    await buildProject('build')
                }
            })
        })
    )
    .addCommand(new Command('build')
        .description('Run \"cmake --build build\" on current working directory')
        .action(async (options) => {
            await buildProject('build')
        })
    )
    .version('1.1.0')
    .parse()