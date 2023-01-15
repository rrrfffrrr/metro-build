import { ICommandGroup } from "../defines";
import Builder from "./builder";

export abstract class BaseASTNode {
    public abstract build(builder: Builder) : Builder
}

export class EmptyNode extends BaseASTNode {
    public build(builder: Builder): Builder {
        return builder
    }
}

export class SequenceNode extends BaseASTNode {
    sequence: BaseASTNode[]

    constructor(sequence: BaseASTNode[]) {
        super()

        this.sequence = sequence
    }
    public build(builder: Builder): Builder {
        this.sequence.forEach(v => v.build(builder))
        return builder
    }
}

export class CustomCommandNode extends BaseASTNode {
    commands: string[]

    constructor(commands: string[]) {
        super()
        this.commands = commands
    }

    public build(builder: Builder) : Builder {
        builder.push(...this.commands)
        return builder
    }
}

export class CommandGroupNode extends BaseASTNode {
    indent: number
    preCommands: BaseASTNode
    nextNode: BaseASTNode
    postCommands: BaseASTNode

    constructor(commandGroup: ICommandGroup, indent: number = 1) {
        super()

        this.indent = indent
        this.preCommands = commandGroup.preCommands ? new CustomCommandNode(commandGroup.preCommands) : new EmptyNode()
        this.nextNode = new EmptyNode()
        this.postCommands = commandGroup.postCommands ? new CustomCommandNode(commandGroup.postCommands) : new EmptyNode()
    }

    static parse(commandGroup: ICommandGroup, nextNode?: BaseASTNode): BaseASTNode {
        var node = new CommandGroupNode(commandGroup)
        node.nextNode = nextNode ?? new EmptyNode()
        return node
    }

    public build(builder: Builder): Builder {
        builder.addIndent(this.indent)
            this.preCommands.build(builder)
            this.nextNode.build(builder)
            this.postCommands.build(builder)
        builder.removeIndent(this.indent)
        return builder
    }
}

export class RegionNode extends BaseASTNode {
    name: string
    nextNode: BaseASTNode
    indent: number

    constructor(name: string, nextNode: BaseASTNode, indent: number = 0) {
        super()

        this.name = name
        this.nextNode = nextNode
        this.indent = indent
    }

    public build(builder: Builder): Builder {
        builder.push(`# <-- ${this.name} -->`)
        builder.addIndent(this.indent)
            this.nextNode.build(builder)
        builder.removeIndent(this.indent)
        builder.push(`# <-- ${this.name} -->`)
        return builder
    }
}

export class BlockNode extends BaseASTNode {
    indent: number
    nextNode: BaseASTNode
    propagate: string[]

    constructor(nextNode: BaseASTNode, propagate: string[], indent: number = 1) {
        super()

        this.indent = indent
        this.nextNode = nextNode
        this.propagate = propagate
    }

    static parse(nextNode: BaseASTNode, propagate:string[] = [], indent: number = 1): BaseASTNode {
        return new BlockNode(nextNode, propagate, indent)
    }
    
    public build(builder: Builder): Builder {
        builder.push(`block(${((this.propagate && this.propagate.length > 0) ? `PROPAGATE ${this.propagate.join(' ')}` : '')})`)
        builder.addIndent(this.indent)
        this.nextNode.build(builder)
        builder.removeIndent(this.indent)
        builder.push(`endblock()`)
        return builder
    }
}