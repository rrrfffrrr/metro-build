export const ProgramTypes = [ 'executable', 'library' ]
export type ProgramTypes = 'executable' | 'library'
export interface IProgram {
    type: ProgramTypes
    name: string
    dependencies: string[]

    targets: {[key: string]: SegmentType[]}

    preCommands?: string[]
    postCommands?: string[]
}

interface IProgramSegment {
    preCommands?: string[]
    postCommands?: string[]
}

export type SegmentType = IProgramSourceSegment | IProgramSharedSegment | IProgramStaticSegment | IProgramIncludeSegment
export interface IProgramSourceSegment extends IProgramSegment {
    type: 'source'

    sources: string[]
    includePath?: string[]
}

export interface IProgramStaticSegment extends IProgramSegment {
    type: 'static'

    includePath?: string[]
    staticLibrary: string
}

export interface IProgramSharedSegment extends IProgramSegment {
    type: 'shared'

    includePath?: string[]
    staticLibrary: string
    sharedLibrary: string
}

export interface IProgramIncludeSegment extends IProgramSegment {
    type: 'include'

    includePath: string[]
    staticLibrary?: undefined
    sharedLibrary?: undefined
}

export function generateCommands(program: IProgram, target_platform: string): string[] {
    let commands: string[] = []
    let segmentCount = {
        source: 0,
        static: 0,
        shared: 0,
        include: 0
    }

    commands.push(`# <--- ${program.name} --->`)

    if (program.preCommands) {
        commands.push(...program.preCommands)
    }

    // Create target
    switch(program.type) {
        case "executable":
            commands.push(`add_executable(${program.name})`)
            break
        case "library":
            commands.push(`add_library(${program.name} INTERFACE)`)
            break
        default:
            throw new Error(`Invalid program block type "${program.type}"`)
    }

    const targetSegment = program.targets[target_platform]
    if (!targetSegment)
        throw new Error(`Target platform(${target_platform}) does not exist in program(${program.name})`)

    for(const segment of targetSegment) {
        let id = segmentCount[segment.type]++;
        commands.push(...generateSegmentCommands(program.name, id, segment))
    }

    if (program.postCommands) {
        commands.push(...program.postCommands)
    }

    commands.push(`# <--- ${program.name} --->`)

    return commands
}

function generateSegmentCommands(target: string, id: number, segment: SegmentType): string[] {
    let commands: string[] = []
    const config = ''

    if (segment.preCommands) {
        commands.push(...segment.preCommands)
    }

    switch(segment.type) {
        case "source": {
                commands.push(`target_sources(${target} ${segment.sources!.map(v => `\n\tPRIVATE \"${v}\"`).join('')}\n)`)
                if (segment.includePath)
                    commands.push(`target_include_directories(${target} ${segment.includePath.map(v => `\n\tPUBLIC \"${v}\"`).join('')}\n)`)
                break
            }
        case "shared": {
                let sub_target = `${target}_SHARED_${id}`
                commands.push(`add_library(${sub_target} SHARED IMPORTED)`)

                if (segment.includePath)
                    commands.push(`set_target_properties(${sub_target} PROPERTIES INTERFACE_INCLUDE_DIRECTORIES ${segment.includePath.map(v => `\"${v}\"`).join(';')})`)
                commands.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_IMPLIB${config} \"${segment.sharedLibrary}\")`)
                commands.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_LOCATION${config} \"${segment.staticLibrary}\")`)
            
                commands.push(`target_link_libraries(${target} INTERFACE ${sub_target})`)
                break
            }
        case "static": {
                let sub_target = `${target}_STATIC_${id}`
                commands.push(`add_library(${sub_target} STATIC IMPORTED)`)
                
                if (segment.includePath)
                    commands.push(`set_target_properties(${sub_target} PROPERTIES INTERFACE_INCLUDE_DIRECTORIES ${segment.includePath.map(v => `\"${v}\"`).join(';')})`)
                commands.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_LOCATION${config} \"${segment.staticLibrary}\")`)
                        
                commands.push(`target_link_libraries(${target} INTERFACE ${sub_target})`)
                break
            }
        case "include": {
                commands.push(`target_include_directories(${target} ${segment.includePath!.map(v => `\n\tPUBLIC ${v}`).join('')}\n)`)
                break
            }
        default:
            throw new Error(`Unexpected segment type`)
    }

    if (segment.postCommands) {
        commands.push(...segment.postCommands)
    }

    return commands
}