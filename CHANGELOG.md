# Change Log

## [0.1.5]

- Initial release

## [0.2.0]

- Added autocompletion for functions in the Functions Library defined by the user (note: `CfgFunctions.hpp` needs to be generated at least once after opening the editor for the autocompletion to work)

## [0.3.0]

- Added an option/task to generate `CfgRemoteExec.hpp` template based on the `CfgFunctions.hpp`
  - Note that you must generate the `CfgFunctions.hpp` at least once and make sure that the file is active by clicking on it in the editor view before you can run the `Generate CfgRemoteExec template (Arma 3)` task. (`Ctrl` + `Shift` + `P`)

## [0.4.0]

- Fixed IntelliSense suggestions. The editor/IntelliSense should now suggest autocompletion of defined functions properly when you start typing the full function name (starting from your developer tag/prefix).

## [0.5.0]

- Added support for `postInit` and `preInit` attributes for functions. Name your function `fn_preInit_yourFunction.sqf` or `fn_postInit_yourFunction.sqf` to include the needed attribute.

### [0.5.1]

- Hotfix: missing semicolon when using attributes on core functions.

## [1.0.0]
- Support for persistent remote execution framework (`CfgRemoteExec.hpp`) parameters (function targets and JIP (Join In Progress)) for added security.
