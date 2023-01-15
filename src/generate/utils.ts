import Builder from "./builder"

export function buildBlock(builder: Builder, callback: () => any, propagate:string[] = [], indent: number = 1): Builder {
    builder.push(`block(${((propagate && propagate.length > 0) ? `PROPAGATE ${propagate.join(' ')}` : '')})`)
    builder.addIndent(indent)
    callback()
    builder.removeIndent(indent)
    builder.push(`endblock()`)
    return builder
}