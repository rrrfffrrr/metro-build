export function getPreventInSourceBuildCommand() {
    return [
        `if(\${CMAKE_CURRENT_SOURCE_DIR} STREQUAL \${CMAKE_CURRENT_BINARY_DIR})`,
        `   message(FATAL_ERROR "In-tree builds are not allowed! Please run "cmake -S \${CMAKE_SOURCE_DIR} -B \${CMAKE_SOURCE_DIR}/dist" and using it.")`,
        `endif()`
    ]
}