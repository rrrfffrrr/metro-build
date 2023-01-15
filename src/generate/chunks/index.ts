import { ProgramChunkType } from '../../defines'
import { BaseASTNode } from '../astnode'
import { IncludeChunkNode } from './include-chunk'
import { SharedChunkNode } from './shared-chunk'
import { SourceChunkNode } from './source-chunk'
import { StaticChunkNode } from './static-chunk'

export function parse(chunk: ProgramChunkType): BaseASTNode {
    switch(chunk.type) {
        case 'source':
            return SourceChunkNode.parse(chunk)
        case 'include':
            return IncludeChunkNode.parse(chunk)
        case 'static':
            return StaticChunkNode.parse(chunk)
        case 'shared':
            return SharedChunkNode.parse(chunk)
        default: throw new Error(`Invalid chunk type \"${chunk}\"`)
    }
}