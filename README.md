# MMM-Modal [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/fewieden/MMM-Modal/master/LICENSE) [![Build Status](https://travis-ci.org/fewieden/MMM-Modal.svg?branch=master)](https://travis-ci.org/fewieden/MMM-Modal) [![Code Climate](https://codeclimate.com/github/fewieden/MMM-Modal/badges/gpa.svg?style=flat)](https://codeclimate.com/github/fewieden/MMM-Modal) [![Known Vulnerabilities](https://snyk.io/test/github/fewieden/mmm-modal/badge.svg)](https://snyk.io/test/github/fewieden/mmm-modal) [![API Doc](https://doclets.io/fewieden/MMM-Modal/master.svg)](https://doclets.io/fewieden/MMM-Modal/master)

Modal window Module for MagicMirror²

## Dependencies

* An installation of [MagicMirror²](https://github.com/MichMich/MagicMirror)
* OPTIONAL: [Voice Control](https://github.com/fewieden/MMM-voice)
* npm
* [node-fetch](https://www.npmjs.com/package/node-fetch)

## Installation

1. Clone this repo into `~/MagicMirror/modules` directory.
1. Configure your `~/MagicMirror/config/config.js`:

    ```
    {
        module: 'MMM-Modal',
        config: {
            ...
        }
    }
    ```

1. Run command `npm i --production` in `~/MagicMirror/modules/MMM-Modal` directory.

## Config Options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `timer` | false | Either `false` (buttons/voice control) or milliseconds how long a modal should remain open. |

## OPTIONAL: Voice Control

This module supports voice control by
[MMM-voice](https://github.com/fewieden/MMM-voice). In order to use this
feature, it's required to install the voice module. There are no extra config
options for voice control needed.

### Mode

The voice control mode for this module is `MODAL`

### List of all Voice Commands

* OPEN HELP -> Shows the information from the readme here with mode and all commands.
* CLOSE HELP -> Hides the help information.
* CLOSE MODAL -> Closes the open modal.
