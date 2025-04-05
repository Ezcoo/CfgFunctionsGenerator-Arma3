# CfgFunctions.hpp Generator (Arma 3)

This Visual Studio Code extension creates `CfgFunctions.hpp` (Functions Library) file with a simple click of a button when developing Arma 3. 

Generating `CfgRemoteExec.hpp` (Remote Execution Framework) with persistent parameters is also supported (see documentation below).

This extension is somewhat opinionated when it comes to secure scripting. It intends and attempts to make basically all script based cheats useless.


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
* Support for `postInit` and `preInit` attributes.
  * Name your function `fn_preInit_yourFunction.sqf` or `fn_postInit_yourFunction.sqf` to include the needed attribute. (Since v0.5.0)
* Support for persistent remote execution framework (`CfgRemoteExec.hpp`) parameters (function targets and JIP (Join In Progress)) for added security. (since v1.0.0)
  * For persistent CfgRemoteExec parameters, use formatting `fn_%1_%2_functionName.sqf` where `%1 = ALL || CLIENT || SERVER` and `%2 = JIP`. Or the former in reverse order, it's supported too.
    * Example: `fn_CLIENT_JIP_getCarKeys.sqf` or `fn_JIP_CLIENT_getCarKeys.sqf`. Or: `fn_SERVER_JIP_loadUnitData.sqf` or `fn_JIP_SERVER_loadUnitData.sqf`. 
    * If you don't need to send a function call to JIP (Join In Progress) queue, just leave the `JIP` part off. Example: `fn_SERVER_loadUnitData.sqf` or `fn_CLIENT_loadUnitData.sqf`.
    * Also adding `JIP` parameter only is supported for special cases, but it's not recommended. If the `JIP` only gets defined, the remote execution will allow all targets. (It's better to have separate functions for targeting server and clients.)
* Support for loading and overriding global extension settings with local config file (especially useful in complex projects). (Since v1.3.0)


## Requirements

* Up-to-date Visual Studio Code installation.
* (Empty) `CfgFunctions.hpp` file in `MISSION_OR_CAMPAIGN_ROOT/functions/` folder.
* Filenames of SQF files to be included must start with `'fn_'`.
* SQF files must be located in _subfolder_ of `MISSION_OR_CAMPAIGN_ROOT/functions/` folder.
* `CfgFunctions.hpp` file needs to be open and the active file in the editor.
* To generate `CfgRemoteExec.hpp`, you must have `CfgFunctions.hpp` open and as active file in the editor.


## Extension Settings

* Global settings:
  * Personal/project tag to avoid naming conflicts.
  * Toggle to enable/disable allowing debug mode (functions recompile and logging).
  * PBO prefix for addon development and/or complex projects.
* Local settings (override of global settings):
  * Create a config file named exactly `cfgFunctions.txt` in the same directory with `CfgFunctions.hpp`. Ensure that the file has `.txt` as its file extension. (Pay special attention to this on Windows, as Windows hides file extensions by default.)
    * `cfgFunctions.txt` supports overriding any combination of the three global settings with formatting `settingName=value`, each on their own line. Note that there must be no whitespace in any line.
      * Examples of local config (`cfgFunctions.txt`) settings:
        * `developerTag=yourTag`
        * `pboPrefix=yourPboPrefix`
        * `debugEnabled=true`

## Known Issues

* You must click the `CfgFunctions.hpp` file contents in editor view at first before clicking the "Generate `CfgFunctions.hpp` (Arma 3)" button.
* `CfgFunctions.hpp` generation might fail if `CfgFunctions.hpp` file has been edited and not saved when clicking the generate button.
* Autocompletion of custom user defined functions works only after running the automatic generation of `CfgFunctions.hpp` at least once after opening the editor.
* If you generate `CfgRemoteExec.hpp`:
  * 1. the file must not exist yet (the operation will fail if the file exists already to prevent accidental overwrites),
  * 2. you need to have generated `CfgFunctions.hpp` at least once, and 
  * 3. you need to have the `CfgFunctions.hpp` file active in the editor (by e.g. clicking on it's contents in the normal editor view) when you run the `Generate CfgRemoteExec template (Arma 3)` task. (`Ctrl` + `Shift` + `P`)


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

### 1.0.1

Fix showcase GIFs not showing.

### 1.0.2

Add documentation with examples how to make the Remote Execution Framework's function parameters persistent. (See "Requirements" on this page.)

### 1.0.3

Make `CfgRemoteExec.hpp` generation more tolerant to typos/casing mistakes.
Fix a bug that allowed user to define function as JIP (Join In Progress) one without allowed target(s) getting specified.

### 1.1.0

Add toggle to enable or disable allowing debug mode in Functions library.
Improve documentation in `CfgRemoteExec.hpp`.
Update project description.

### 1.2.0

Add option to add PBO prefix (necessary, if developing an addon instead of a mission).

### 1.3.0

Add option to override extension's global settings with local settings file (especially useful for complex projects and/or addon development). Read README -> Extension Settings for more information.
Fix empty category folders breaking the generation of `CfgFunctions.hpp`.

### 1.3.1

Hotfix developer tag not being set if it was imported from global config (extension settings).

### 1.3.2

Hotfix possible issues with PBO prefix and debug flag (not being set properly if they were imported from global config i.e. extension settings).

### 1.4.0

Fix autocompletion of functions becoming bugged easily. (Because of limitations of Visual Studio Code's extension API, please note that you still need to generate CfgFunctions once when starting development after opening the editor to ensure that your developer tag is set correctly.)

---

**Enjoy!**
