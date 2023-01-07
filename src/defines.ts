export interface ICommandGroup {
    preCommands?: string[]
    postCommands?: string[]
}

export const ProgramTypes = [ 'executable', 'library' ]
export type ProgramTypes = 'executable' | 'library'
export interface IProgram extends ICommandGroup {
    type: ProgramTypes
    name: string

    groups: ISegmentGroup[]
}

interface IProgramSegment extends ICommandGroup { }

export interface ISegmentGroup extends ICommandGroup {
    segments: SegmentType[]
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
    importConfig?: string
    staticLibrary: string
}

export interface IProgramSharedSegment extends IProgramSegment {
    type: 'shared'

    includePath?: string[]
    importConfig?: string
    staticLibrary: string
    sharedLibrary: string
}

export interface IProgramIncludeSegment extends IProgramSegment {
    type: 'include'

    includePath: string[]
    staticLibrary?: undefined
    sharedLibrary?: undefined
}