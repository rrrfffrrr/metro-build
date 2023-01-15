import { IFilePath, IProgramSharedChunk } from "../../defines"
import { BaseASTNode, CommandGroupNode, RegionNode } from "../astnode"
import Builder from "../builder"
import { buildIncludeInterface, normalizeFilePath, parsePath } from "./utils"
import { buildBlock } from "../utils"

export class SharedChunkNode extends BaseASTNode {
    importConfig?: string
    staticLibrary: IFilePath
    sharedLibrary: IFilePath
    includePath: IFilePath[]

    constructor(chunk: IProgramSharedChunk) {
        super()

        this.importConfig = chunk.importConfig
        this.staticLibrary = normalizeFilePath(chunk.staticLibrary)
        this.sharedLibrary = normalizeFilePath(chunk.sharedLibrary)
        this.includePath = chunk.includePath?.map(
            v => normalizeFilePath(v)
        ) ?? []
    }

    static parse(chunk: IProgramSharedChunk): BaseASTNode {
        let node = new SharedChunkNode(chunk)
        return new RegionNode(
            chunk.type,
            CommandGroupNode.parse(chunk, node)
        )
    }

    public build(builder: Builder): Builder {
        const ImportConfig = this.importConfig ? `_${this.importConfig}` : ''
        let sub_target = `${builder.target}_STATIC_${builder.currentCount.shared++}`
        builder.push(`add_library(${sub_target} STATIC IMPORTED)`)

        buildBlock(builder, () => {
            builder.push(`set(CURRENT_TARGET ${sub_target})`)
            builder.push(`set(LATEST_TARGET ${sub_target})`)

            buildIncludeInterface(builder, sub_target, this.includePath)
            builder.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_IMPLIB${ImportConfig} ${parsePath(this.staticLibrary)})`)
            builder.push(`set_target_properties(${sub_target} PROPERTIES IMPORTED_LOCATION${ImportConfig} ${parsePath(this.sharedLibrary)})`)
            
            builder.push(`target_link_libraries(${builder.target} INTERFACE ${sub_target})`)
        }, ['LATEST_TARGET'])
        return builder
    }
}