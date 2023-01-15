import { IFilePath, IProgramSourceChunk } from "../../defines"
import { BaseASTNode, CommandGroupNode, RegionNode } from "../astnode"
import Builder from "../builder"
import { buildInclude, buildSource, normalizeFilePath } from "./utils"

export class SourceChunkNode extends BaseASTNode {
    sources: IFilePath[]
    includePath: IFilePath[]

    constructor(chunk: IProgramSourceChunk) {
        super()

        this.sources = chunk.sources.map(
            v => normalizeFilePath(v)
        )
        this.includePath = chunk.includePath?.map(
            v => normalizeFilePath(v)
        ) ?? []
    }

    static parse(chunk: IProgramSourceChunk): BaseASTNode {
        let node = new SourceChunkNode(chunk)
        return new RegionNode(
            chunk.type,
            CommandGroupNode.parse(chunk, node)
        )
    }

    public build(builder: Builder): Builder {
        buildSource(builder, this.sources)
        buildInclude(builder, this.includePath)
        return builder
    }
}