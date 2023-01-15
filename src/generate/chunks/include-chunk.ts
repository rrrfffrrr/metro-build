import { IFilePath, IProgramIncludeChunk } from "../../defines"
import { BaseASTNode, CommandGroupNode, RegionNode } from "../astnode"
import Builder from "../builder"
import { buildInclude, normalizeFilePath } from "./utils"

export class IncludeChunkNode extends BaseASTNode {
    includePath: IFilePath[]

    constructor(chunk: IProgramIncludeChunk) {
        super()

        this.includePath = chunk.includePath.map(
            v => normalizeFilePath(v)
        )
    }

    static parse(chunk: IProgramIncludeChunk): BaseASTNode {
        let node = new IncludeChunkNode(chunk)
        return new RegionNode(
            chunk.type,
            CommandGroupNode.parse(chunk, node)
        )
    }

    public build(builder: Builder): Builder {
        buildInclude(builder, this.includePath)
        return builder
    }
}