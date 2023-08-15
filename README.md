# CfgFunctions.hpp Generator (Arma 3)

This Visual Studio Code extension creates `CfgFunctions.hpp` file with a simple click of a button when developing Arma 3.

## Features

* Automatic generation of `CfgFunctions.hpp` file with a simple button click in VS Code interface (CfgFunctions.hpp file needs to be open and active)
* Support for even complex projects with multiple dependencies or otherwise complex/large folder structure
* Personal/project tag included in settings (mandatory)
* Autocompletion for functions in the Functions Library that have been defined/added by the user (since v0.2.0) - note that you need to auto-generate `CfgFunctions.hpp` once after opening the editor for the autocompletion to become active

## Requirements

* Up-to-date Visual Studio Code installation
* (Empty) `CfgFunctions.hpp` file in `MISSION_OR_CAMPAIGN_ROOT/functions/` folder
* Filenames of SQF files to be included must start with `'fn_'`
* SQF files must be located in _subfolder_ of `MISSION_OR_CAMPAIGN_ROOT/functions/` folder
* `CfgFunctions.hpp` file needs to be open and the active file in the editor

## Extension Settings

* Personal/project tag to avoid naming conflicts

## Known Issues

* You must click the `CfgFunctions.hpp` file contents in editor view at first before clicking the "Generate CfgFunctions.hpp (Arma 3)" button.
* `CfgFunctions.hpp` generation might fail if CfgFunctions.hpp file has been edited and not saved when clicking the generate button.
* Autocompletion of custom user defined functions works only after running the automatic generation of `CfgFunctions.hpp` at least once after opening the editor.

It's WIP. Expect issues. Bug reports are highly appreciated!

## Release Notes

### 0.1.5

Initial release.

### 0.2.0

Added autocompletion for functions in the Functions Library defined by the user.

---

**Enjoy!**
