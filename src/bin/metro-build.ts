#!/usr/bin/env node

import { cwd } from 'process'
import { program, Option, Command } from 'commander'
import path from 'path'
import fs from 'fs'
import { checkAndGenerateTemplate, getCMakeListsTemplate, getProgramTemplate } from '../template'
import { IProgram, ProgramTypes, generateCommands } from '../module'
import { dispatchContents } from '../cmake'
import { getPreventInSourceBuildCommand } from '../utility'

const LIB_NAME = 'MetroBuild.json'

program
    .addCommand(new Command('init')
        .addOption(new Option('-S, --source <path>', `Path to ${LIB_NAME}`)
            .default(cwd(), 'Current working directory')
        )
        .addOption(new Option('--name <name>')
            .default('Hello')
        )
        .addOption(new Option('-T, --type <type>')
            .default('executable')
            .choices(ProgramTypes)
        )
        .addOption(new Option('-P, --prevent-in-source-build'))
            .description('Add helper commands to prevent cmake -S . -B .')
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
        .addOption(new Option('-T, --target <target>')
            .default('Win64', 'Windows x64')
        )
        .action((options) => {
            const libPath = (<string>options.source).endsWith(LIB_NAME) ? <string>options.source : path.join(options.source, LIB_NAME)
            import(libPath)
                .then(v => v.default)
                .then((program: IProgram) => {
                    const cmakePath = path.join(path.dirname(libPath), 'CMakeLists.txt')
                    if (!fs.existsSync(cmakePath)) {
                        console.log(`No CMakeLists.txt found, generate one: ${cmakePath}`)
                        checkAndGenerateTemplate(cmakePath, getCMakeListsTemplate())
                    }
                    dispatchContents(cmakePath, generateCommands(program, options.target).join('\n'))
                })
        })
    )
    .version('0.0.1')
    .parse()