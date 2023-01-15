import { IProgram, ProgramTypes } from "../defines";
import { BaseASTNode, BlockNode, CommandGroupNode, CustomCommandNode, EmptyNode, RegionNode, SequenceNode } from "./astnode";
import Builder from "./builder";
import { buildBlock } from "./utils";
import { parse as parseChunk } from './chunks'

export class ProgramNode extends BaseASTNode {
    type: ProgramTypes
    name: string

    chunkGroup: SequenceNode

    constructor(program: IProgram) {
        super()

        this.type = program.type
        this.name = program.name

        this.chunkGroup = new SequenceNode([])
    }

    static parse(program: IProgram): BaseASTNode {
        let node = new ProgramNode(program)
        node.chunkGroup = new SequenceNode(
            program.groups.map(group => 
                CommandGroupNode.parse(
                    group,
                    new SequenceNode(group.segments.map(
                        chunk => parseChunk(chunk)
                    ))
                )
            )
        )
        return new RegionNode(
            program.name,
            CommandGroupNode.parse(program, node)
        )
    }

    public build(builder: Builder): Builder {
        switch(this.type) {
            case "executable":
                builder.push(`add_executable(${this.name})`)
                break
            case "library":
                builder.push(`add_library(${this.name} INTERFACE)`)
                break
        }
        buildBlock(builder, () => {
            builder.push(`set(CURRENT_TARGET ${this.name})`)
            builder.push(`set(LATEST_TARGET ${this.name})`)

            this.chunkGroup.build(builder)
        }, ['LATEST_TARGET'])
        return builder.push()
    }
}

export const parse = ProgramNode.parse