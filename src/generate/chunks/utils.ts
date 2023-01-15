import { FilePath, IFilePath } from "../../defines"
import Builder from "../builder"

export function normalizeFilePath(filePath: FilePath) : IFilePath {
    return  (typeof filePath === 'string')
            ? { path: filePath, from: 'source' }
            : filePath
}

export function parsePath(path: IFilePath): string {
    switch(path.from) {
        case 'binary':
            return `\"\${CMAKE_CURRENT_BINARY_DIR}/${path.path}\"`
        case 'source':
            return `\"\${CMAKE_CURRENT_SOURCE_DIR}/${path.path}\"`
        case 'custom':
            return path.path
    }
}

export function buildSource(builder: Builder, sources: IFilePath[]): Builder {
    if (!sources || sources.length < 1)
        return builder
    
    builder.push(`target_sources(${builder.target}`)
    builder.addIndent()
        builder.push(...sources.map(v => `PRIVATE ${parsePath(v)}`))
    builder.removeIndent()
    builder.push(`)`)
    return builder
}

export function buildInclude(builder: Builder, includes: IFilePath[]): Builder {
    if (!includes || includes.length < 1)
        return builder
    
    builder.push(`target_include_directories(${builder.target}`)
    builder.addIndent()
        builder.push(...includes.map(v => `PUBLIC ${parsePath(v)}`))
    builder.removeIndent()
    builder.push(`)`)
    return builder
}

export function buildIncludeInterface(builder: Builder, target: string, includes: IFilePath[]): Builder {
    if (!includes || includes.length < 1)
        return builder
    
    builder.push(`set_target_properties(${target} PROPERTIES INTERFACE_INCLUDE_DIRECTORIES`)
    builder.addIndent()
        builder.push(...includes.map((v, i, a) => `${parsePath(v)}${(a.length > i + 1) ? ';' : '' }`))
    builder.removeIndent()
    builder.push(`)`)
    return builder
}