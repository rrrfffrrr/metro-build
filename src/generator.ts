import { ICommandGroup, IProgram, ISegmentGroup, SegmentType } from './defines'

class GenerateParam {
    private _target: string
    private _commands: string[]
    public currentCount: {
        static: number,
        shared: number
    }
    private _indentLevel: number
    private _indentString: string

    constructor(target: string, indent: string = '\t') {
        this._target = target,
        this._commands = []
        this.currentCount = {
            shared: 0,
            static: 0
        }
        this._indentLevel = 0
        this._indentString = indent
    }

    public get result() {
        return [...this._commands]
    }

    public get target() {
        return this._target
    }

    push(...commands: string[]) {
        this._commands.push(...commands.map(command => `${this._indentString.repeat(this._indentLevel)}${command}`))
    }

    addIndent(level: number = 1) {
        this._indentLevel += level
    }
    removeIndent(level: number = 1) {
        this._indentLevel = Math.max(0, this._indentLevel - level)
    }
}

export function startProgramGeneration(program: IProgram): string[] {
    let param = new GenerateParam(program.name)

    generateProgram(program, param)

    return param.result
}

function generateCommonCommand(input: ICommandGroup, param: GenerateParam, callback: () => any, indent: number = 1) {
    param.addIndent(indent)
    if (input.preCommands)
        param.push(...input.preCommands)
    callback()
    if (input.postCommands)
        param.push(...input.postCommands)
    param.removeIndent(indent)
}

function newScope(param: GenerateParam, callback: () => any, propagate:string[] = [], indent: number = 1) {
    param.push(`block(${((propagate && propagate.length > 0) ? `PROPAGATE ${propagate.join(' ')}` : '')})`)
    param.addIndent()
    callback()
    param.removeIndent()
    param.push(`endblock()`)
}

function generateProgram(input: IProgram, param: GenerateParam) {
    param.push(`# <-- ${input.name} -->`)
    generateCommonCommand(input, param, () => {
        // Create target
        switch(input.type) {
            case "executable":
                param.push(`add_executable(${input.name})`)
                break
            case "library":
                param.push(`add_library(${input.name} INTERFACE)`)
                break
            default:
                throw new Error(`Invalid program block type "${input.type}"`)
        }
        newScope(param, () => {
            param.push(`set(CURRENT_TARGET ${input.name})`)
            param.push(`set(LATEST_TARGET ${input.name})`)

            input.groups.forEach(group => {
                generateSegmentGroup(group, param)
            })
        }, ['LATEST_TARGET'])
    }, 0)
    param.push(`# <-- ${input.name} -->`)
}

function generateSegmentGroup(input: ISegmentGroup, param: GenerateParam) {
    generateCommonCommand(input, param, () => {
        input.segments.forEach(segment => {
            generateSegment(segment, param)
        })
    })
}

function generateSegment(input: SegmentType, param: GenerateParam) {
    param.push(`# <-- ${input.type} -->`)
    generateCommonCommand(input, param, () => {
        switch(input.type) {
            case "source": {
                param.push(`target_sources(${param.target}`)
                param.addIndent()
                param.push(...input.sources.map(v => `PRIVATE \"\${CMAKE_CURRENT_SOURCE_DIR}/${v}\"`))
                param.removeIndent()
                param.push(`)`)
                checkAndGenerateIncludePath(input.includePath, param)
                break
            }
            case "shared": {
                const ImportConfig = input.importConfig ? `_${input.importConfig}` : ''
                let sub_target = `${param.target}_SHARED_${param.currentCount.shared++}`
                param.push(`add_library(${sub_target} SHARED IMPORTED)`)

                newScope(param, () => {
                    param.push(`set(CURRENT_TARGET ${sub_target})`)
                    param.push(`set(LATEST_TARGET ${sub_target})`)
        
                    checkAndGenerateInterfaceIncludePath(sub_target, input.includePath, param)
                    param.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_IMPLIB${ImportConfig} \"\${CMAKE_CURRENT_SOURCE_DIR}/${input.staticLibrary}\")`)
                    param.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_LOCATION${ImportConfig} \"\${CMAKE_CURRENT_SOURCE_DIR}/${input.sharedLibrary}\")`)
                
                    param.push(`target_link_libraries(${param.target} INTERFACE ${sub_target})`)
                }, ['LATEST_TARGET'])
                break
            }
            case "static": {
                const ImportConfig = input.importConfig ? `_${input.importConfig}` : ''
                let sub_target = `${param.target}_STATIC_${param.currentCount.static++}`
                param.push(`add_library(${sub_target} STATIC IMPORTED)`)
                
                newScope(param, () => {
                    param.push(`set(CURRENT_TARGET ${sub_target})`)
                    param.push(`set(LATEST_TARGET ${sub_target})`)

                    checkAndGenerateInterfaceIncludePath(sub_target, input.includePath, param)
                    param.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_LOCATION${ImportConfig} \"\${CMAKE_CURRENT_SOURCE_DIR}/${input.staticLibrary}\")`)
                            
                    param.push(`target_link_libraries(${param.target} INTERFACE ${sub_target})`)
                }, ['LATEST_TARGET'])
                break
            }
            case "include": {
                param.push('# Add include directories')
                checkAndGenerateIncludePath(input.includePath, param)
                break
            }
            default:
                throw new Error(`Unexpected segment type`)
        }
    })
    param.push(`# <-- ${input.type} -->`)
}

function checkAndGenerateIncludePath(input: undefined | string[], param: GenerateParam) {
    if (!input)
        return
    param.push(`target_include_directories(${param.target}`)
    param.addIndent()
    param.push(...input.map(v => `PUBLIC \"\${CMAKE_CURRENT_SOURCE_DIR}/${v}\"`))
    param.removeIndent()
    param.push(`)`)
}
function checkAndGenerateInterfaceIncludePath(target: string, input: undefined | string[], param: GenerateParam) {
    if (!input)
        return
    param.push(`set_target_properties(${target} PROPERTIES INTERFACE_INCLUDE_DIRECTORIES`)
    param.addIndent()
    param.push(...input.map((v, i, a) => `\"\${CMAKE_CURRENT_SOURCE_DIR}/${v}\"${(a.length > i + 1) ? ';' : '' }`))
    param.removeIndent()
    param.push(`)`)
}