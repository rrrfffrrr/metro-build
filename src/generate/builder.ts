export default class Builder {
    private _target: string
    private _commands: string[]
    public currentCount: {
        static: number,
        shared: number
    }
    private _indentLevel: number
    private _indentString: string

    constructor(target: string, indent: string = '\t') {
        this._target = target,
        this._commands = []
        this.currentCount = {
            shared: 0,
            static: 0
        }
        this._indentLevel = 0
        this._indentString = indent
    }

    public get result() {
        return [...this._commands]
    }

    public get target() {
        return this._target
    }

    push(...commands: string[]) {
        this._commands.push(...commands.map(command => `${this._indentString.repeat(this._indentLevel)}${command}`))
        return this
    }

    addIndent(level: number = 1) {
        this._indentLevel += level
        return this
    }
    removeIndent(level: number = 1) {
        this._indentLevel = Math.max(0, this._indentLevel - level)
        return this
    }
}