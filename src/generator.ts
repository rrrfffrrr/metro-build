import { ICommandGroup, IProgram, ISegmentGroup, SegmentType } from './defines'

interface GenerateParam {
    target: string,
    commands: string[]
    currentCount: {
        static: number,
        shared: number
    }
}

export function startProgramGeneration(program: IProgram): string[] {
    let param: GenerateParam = {
        target: program.name,
        commands: [],
        currentCount: {
            static: 0,
            shared: 0
        }
    }

    generateProgram(program, param)

    return param.commands
}

function generateCommonCommand(input: ICommandGroup, param: GenerateParam, callback: () => any) {
    if (input.preCommands)
        param.commands.push(...input.preCommands)
    callback()
    if (input.postCommands)
        param.commands.push(...input.postCommands)
}

function generateProgram(input: IProgram, param: GenerateParam) {
    generateCommonCommand(input, param, () => {
        // Create target
        switch(input.type) {
            case "executable":
                param.commands.push(`add_executable(${input.name})`)
                break
            case "library":
                param.commands.push(`add_library(${input.name} INTERFACE)`)
                break
            default:
                throw new Error(`Invalid program block type "${input.type}"`)
        }
    
        input.groups.forEach(group => {
            generateSegmentGroup(group, param)
        })
    })
}

function generateSegmentGroup(input: ISegmentGroup, param: GenerateParam) {
    generateCommonCommand(input, param, () => {
        input.segments.forEach(segment => {
            generateSegment(segment, param)
        })
    })
}

function generateSegment(input: SegmentType, param: GenerateParam) {
    generateCommonCommand(input, param, () => {
        switch(input.type) {
            case "source": {
                param.commands.push(`target_sources(${param.target} ${input.sources!.map(v => `\n\tPRIVATE \"${v}\"`).join('')}\n)`)
                if (input.includePath)
                    param.commands.push(`target_include_directories(${param.target} ${input.includePath.map(v => `\n\tPUBLIC \"${v}\"`).join('')}\n)`)
                break
            }
            case "shared": {
                const ImportConfig = input.importConfig ? `_${input.importConfig}` : ''
                let sub_target = `${param.target}_SHARED_${param.currentCount.shared}`
                param.commands.push(`add_library(${sub_target} SHARED IMPORTED)`)

                if (input.includePath)
                    param.commands.push(`set_target_properties(${sub_target} PROPERTIES INTERFACE_INCLUDE_DIRECTORIES ${input.includePath.map(v => `\"${v}\"`).join(';')})`)
                param.commands.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_IMPLIB${ImportConfig} \"${input.sharedLibrary}\")`)
                param.commands.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_LOCATION${ImportConfig} \"${input.staticLibrary}\")`)
            
                param.commands.push(`target_link_libraries(${param.target} INTERFACE ${sub_target})`)
                break
            }
            case "static": {
                const ImportConfig = input.importConfig ? `_${input.importConfig}` : ''
                let sub_target = `${param.target}_STATIC_${param.currentCount.static}`
                param.commands.push(`add_library(${sub_target} STATIC IMPORTED)`)
                
                if (input.includePath)
                    param.commands.push(`set_target_properties(${sub_target} PROPERTIES INTERFACE_INCLUDE_DIRECTORIES ${input.includePath.map(v => `\"${v}\"`).join(';')})`)
                param.commands.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_LOCATION${ImportConfig} \"${input.staticLibrary}\")`)
                        
                param.commands.push(`target_link_libraries(${param.target} INTERFACE ${sub_target})`)
                break
            }
            case "include": {
                param.commands.push(`target_include_directories(${param.target} ${input.includePath!.map(v => `\n\tPUBLIC ${v}`).join('')}\n)`)
                break
            }
            default:
                throw new Error(`Unexpected segment type`)
        }
    })
}