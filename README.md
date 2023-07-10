# CfgFunctions.hpp Generator README

This Visual Studio Code extension creates CfgFunctions.hpp file with a simple click of a button when developing Arma 3.

## Features

* Automatic generation of CfgFunctions.hpp file by clicking a button in VS Code interface
* Support for even complex projects with multiple dependencies or otherwise complex/large folder structure
* Personal/project tag included in settings (mandatory)

## Requirements

* Up-to-date Visual Studio Code installation
* (Empty) CfgFunctions.hpp file in `MISSION_OR_CAMPAIGN_ROOT/functions/` folder
* Filenames of SQF files to be included must start with `'fn_'`
* SQF files must be located in _subfolder_ of `MISSION_OR_CAMPAIGN_ROOT/functions/` folder

## Extension Settings

* Personal/project tag to avoid naming conflicts

## Known Issues

* You must click the CfgFunctions.hpp file contents in editor view at first before clicking the "Generate CfgFunctions.hpp (Arma 3)" button.
* CfgFunctions.hpp generation might fail if CfgFunctions.hpp file has been edited and not saved when clicking the generate button.

It's WIP. Expect issues.

## Release Notes

### 0.1.0

Initial release.

---

**Enjoy!**
