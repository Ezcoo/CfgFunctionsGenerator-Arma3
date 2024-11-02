# CfgFunctions.hpp Generator (Arma 3)

This Visual Studio Code extension creates `CfgFunctions.hpp` file with a simple click of a button when developing Arma 3.

## Showcase


### CfgFunctions generation
<img src="https://raw.githubusercontent.com/Ezcoo/CfgFunctionsGenerator-Arma3/refs/heads/main/gif/cfgFunctions.gif" width="100%" height="100%">


### CfgRemoteExec generation
<img src="https://raw.githubusercontent.com/Ezcoo/CfgFunctionsGenerator-Arma3/refs/heads/main/gif/cfgRemoteExec.gif" width="100%" height="100%">


## Features

* Automatic generation of `CfgFunctions.hpp` file with a simple button click in VS Code interface (`CfgFunctions.hpp` file needs to be open and active)
* Support for even complex projects with multiple dependencies or otherwise complex/large folder structure
* Personal/project tag included in settings (mandatory)
* Autocompletion for functions in the Functions Library that have been defined/added by the user (since v0.2.0) - note that you need to auto-generate `CfgFunctions.hpp` once after opening the editor for the autocompletion to become active
* Generation of `CfgRemoteExec.hpp` template based on your custom functions by running a task (`Ctrl` + `Shift` + `P`) (since v0.3.0)
* Support for `postInit` and `preInit` attributes. Name your function `fn_preInit_yourFunction.sqf` or `fn_postInit_yourFunction.sqf` to include the needed attribute. (Since v0.5.0)
* Support for persistent remote execution framework (`CfgRemoteExec.hpp`) parameters (function targets and JIP (Join In Progress)) for added security. (since v1.0.0)

## Requirements

* Up-to-date Visual Studio Code installation
* (Empty) `CfgFunctions.hpp` file in `MISSION_OR_CAMPAIGN_ROOT/functions/` folder
* Filenames of SQF files to be included must start with `'fn_'`
* SQF files must be located in _subfolder_ of `MISSION_OR_CAMPAIGN_ROOT/functions/` folder
* `CfgFunctions.hpp` file needs to be open and the active file in the editor
* To generate `CfgRemoteExec.hpp`, you need to have `CfgFunctions.hpp` open and as active file in the editor

## Extension Settings

* Personal/project tag to avoid naming conflicts

## Known Issues

* You must click the `CfgFunctions.hpp` file contents in editor view at first before clicking the "Generate CfgFunctions.hpp (Arma 3)" button.
* `CfgFunctions.hpp` generation might fail if `CfgFunctions.hpp` file has been edited and not saved when clicking the generate button.
* Autocompletion of custom user defined functions works only after running the automatic generation of `CfgFunctions.hpp` at least once after opening the editor.
* If you generate `CfgRemoteExec.hpp`, 1. the file must not exist yet (the operation will fail if the file exists already to prevent accidental overwrites), 2. you need to have generated `CfgFunctions.hpp` at least once, and 3. have the `CfgFunctions.hpp` file active in the editor (by e.g. clicking on it's contents in the normal editor view) when you run the `Generate CfgRemoteExec template (Arma 3)` task. (`Ctrl` + `Shift` + `P`)

Bug reports are highly appreciated!

## Release Notes

### 0.1.5

Initial release.

### 0.2.0

Added autocompletion for functions in the Functions Library defined by the user.

### 0.3.0

Added an option/task to generate `CfgRemoteExec.hpp` template based on the `CfgFunctions.hpp`.

Note that you must generate the `CfgFunctions.hpp` at least once and make sure that the file is active by clicking on it in the editor view before you can run the `Generate CfgRemoteExec template (Arma 3)` task. (`Ctrl` + `Shift` + `P`)

### 0.4.0

Fixed IntelliSense suggestions. The editor/IntelliSense should now suggest autocompletion of defined functions properly when you start typing the full function name (starting from your developer tag/prefix).

### 0.5.0

Added support for `postInit` and `preInit` attributes for functions. Name your function `fn_preInit_yourFunction.sqf` or `fn_postInit_yourFunction.sqf` to include the needed attribute.

### 0.5.1

Hotfix: missing semicolon when using attributes on core functions.

### 1.0.0

Support for persistent remote execution framework (`CfgRemoteExec.hpp`) parameters (function targets and JIP (Join In Progress)) for added security.


---

**Enjoy!**
