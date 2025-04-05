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

# [1.0.0]
- Support for persistent remote execution framework (`CfgRemoteExec.hpp`) parameters (function targets and JIP (Join In Progress)) for added security.

### [1.0.1]
- Fix showcase GIFs not showing.

### [1.0.2]

- Add documentation with examples how to make the Remote Execution Framework's function parameters persistent. (See "Requirements" on the README page.)

### [1.0.3]

- Make CfgRemoteExec.hpp generation more tolerant to typos/casing mistakes.
- Fix a bug that allowed user to define function as JIP (Join In Progress) one without allowed target(s) getting specified.

## [1.1.0]

- Add toggle to enable or disable allowing debug mode in Functions library.
- Improve documentation in `CfgRemoteExec.hpp`.
- Update project description.

## [1.2.0]

- Add option to add PBO prefix (necessary, if developing an addon instead of a mission).

## [1.3.0]

- Add option to override extension's global settings with local settings file (especially useful for complex projects and/or addon development). See README -> Extension Settings for more information.
- Fix empty category folders breaking the generation of `CfgFunctions.hpp`.

## [1.3.1]

- Hotfix developer tag not being set if it was imported from global config (extension settings).

## [1.3.2]

- Hotfix possible issues with PBO prefix and debug flag (not being set properly if they were imported from global config i.e. extension settings).

## [1.4.0]

- Fix autocompletion of functions becoming bugged easily. (Because of limitations of Visual Studio Code's extension API, please note that you still need to generate CfgFunctions once when starting development after opening the editor to ensure that your developer tag is set correctly.)