import { ICommandGroup } from "./command"

export type FileType ='source' | 'build' | 'custom'
export interface IFilePath {
    path: string,
    from: FileType
}

export type FilePath = IFilePath | string

export interface IProgramSourceChunk extends ICommandGroup {
    type: 'source'

    sources: FilePath[]
    includePath?: string[]
}

export interface IProgramStaticChunk extends ICommandGroup {
    type: 'static'

    includePath?: FilePath[]
    importConfig?: string
    staticLibrary: FilePath
}

export interface IProgramSharedChunk extends ICommandGroup {
    type: 'shared'

    includePath?: FilePath[]
    importConfig?: string
    staticLibrary: FilePath
    sharedLibrary: FilePath
}

export interface IProgramIncludeChunk extends ICommandGroup {
    type: 'include'

    includePath: FilePath[]
    staticLibrary?: undefined
    sharedLibrary?: undefined
}

export type ProgramChunkType = IProgramSourceChunk | IProgramSharedChunk | IProgramStaticChunk | IProgramIncludeChunk

export interface IChunkGroup extends ICommandGroup {
    chunks: ProgramChunkType[]
}