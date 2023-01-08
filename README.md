# metro-build
A CMakeLists generator

# Requirement
 - cmake <3.25 or higher>
 - nodejs <Not tested>

# Install
### Using npm
`npm install -g metro-build`
### Using sourcecode
`git clone https://github.com/rrrfffrrr/metro-build.git`  
`cd metro-build`  
`npm install -g .`

# Commands
### init
Generate template MetroBuild.json and CMakeLists.txt
```
Usage: metro-build init [options]

Options:
  -S, --source <path>            Path to MetroBuild.json (default: Current working directory)
  --name <name>                  Set name of executable(library) (default: "Hello")
  -T, --type <type>              Whether executable or library (choices: "executable", "library", default: "executable")
  -P, --prevent-in-source-build  Add helper commands to prevent "cmake -S . -B ."
  -h, --help                     display help for command
```
### generate
Parse MetroBuild.json and dispatch cmake commands to CMakeLists.txt  
Commands will be pasted inside of METRO_BUILD region
```
Usage: metro-build generate [options]

Options:
  -S, --source <path>     Path to MetroBuild.json (default: Current working directory)
  -R, --recursive         Also generating sub-dirs
  -G, --generate-project  Run "cmake -S . -B build"
  -B, --build-project     Run "cmake --build build"
  -h, --help              display help for command
```
```
<cmake scripts>
#region METRO_BUILD
<Auto generated contents>
#endregion METRO_BUILD
<cmake scripts>
```
### build
Help command to build project
```
Usage: metro-build build [options]

Run "cmake --build build" on current working directory

Options:
  -h, --help  display help for command
```