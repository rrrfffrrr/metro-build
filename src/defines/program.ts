import { ICommandGroup } from './command'
import { IChunkGroup } from './chunks'

export const ProgramTypes = [ 'executable', 'library' ]
export type ProgramTypes = 'executable' | 'library'
export interface IProgram extends ICommandGroup {
    type: ProgramTypes
    name: string

    groups: IChunkGroup[]
}