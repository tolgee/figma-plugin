<h1 align="center" style="border-bottom: none">
    <b>
        <a href="https://www.figma.com/community/plugin/1212381421658754793/tolgee-localization">Tolgee Figma Plugin for Localization</a><br>
    </b>
 Manage translations in your Figma files
</h1>

<div align="center"> 

[<img src="https://raw.githubusercontent.com/tolgee/documentation/main/tolgee_logo_text.svg" alt="Tolgee" width="200" />](https://tolgee.io)

This repository contains the code for the Tolgee Figma Plugin.

![test workflow](https://github.com/tolgee/figma-plugin/actions/workflows/test.yml/badge.svg)
![licence](https://img.shields.io/github/license/tolgee/figma-plugin)
[![github stars](https://img.shields.io/github/stars/tolgee/figma-plugin?style=social)](https://github.com/tolgee/figma-plugin)
[![github stars](https://img.shields.io/github/stars/tolgee/tolgee-platform?style=social&label=Tolgee%20Platform)](https://github.com/tolgee/tolgee-platform)
[![Github discussions](https://img.shields.io/github/discussions/tolgee/tolgee-platform)](https://github.com/tolgee/tolgee-platform/discussions)
[![Read the Docs](https://img.shields.io/badge/Read%20the%20Docs-8CA1AF?logo=readthedocs&logoColor=fff)](https://docs.tolgee.io/)
[![Slack](https://img.shields.io/badge/Slack-4A154B?logo=slack&logoColor=fff)](https://join.slack.com/t/tolgeecommunity/shared_invite/zt-2zp55d175-_agXTfKKVbf1BYXlKlmwbA)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://www.youtube.com/@tolgee)
[![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?logo=linkedin-white&logoColor=fff)](https://www.linkedin.com/company/tolgee/)
[![X](https://img.shields.io/badge/X-%23000000.svg?logo=X&logoColor=white)](https://x.com/Tolgee_i18n)

</div>

![Screenshot Tolgee Figma Plugin](images/figma-plugin-banner.png)

Easily manage translations within your Figma design files by connecting Figma with Tolgee localization platform. With Tolgee's Figma plugin, the localization team can save time, simplify collaboration, and reduce errors in their localization process.

## Install Plugin

You can download our Figma plugin here:

[https://www.figma.com/community/plugin/1212381421658754793/tolgee-localization](https://www.figma.com/community/plugin/1212381421658754793/tolgee-localization)

## Additional information

To learn more, visit https://tolgee.io

Or visit our main GitHub page: https://github.com/tolgee/tolgee-platform

👇 Consider supporting us with your stars ⭐️

[![github stars](https://img.shields.io/github/stars/tolgee/figma-plugin?style=social)](https://github.com/tolgee/figma-plugin)

## Features

- Push seamlessly your translations from Figma to Tolgee
- Pull your translations from Tolgee back to your Figma designs
- Switch languages in your Figma designs
- Create page copies with key names or translations
- Upload screenshots

## Usage Guide

To learn how to use it, you can refer to the Tolgee Docs pages for the plugin: [Figma Plugin Setup](https://docs.tolgee.io/platform/integrations/figma_plugin/setup) and [Figma Plugin Usage](https://docs.tolgee.io/platform/integrations/figma_plugin/usage)

Here is a quick guide on how to set it up:

- Clone the repository and link it to your local Figma Desktop app
- Run the `Setup Tolgee` command and enter the URL of your Tolgee instance as well as well as an API key for the project with the `translations.edit` and `translations.view` scope.
- Name all nodes that should be synced by their tolgee key, prefixed by `t:`
- Run `Sync Tolgee to Figma` or `Sync Figma To Tolgee`
- Select all translations that should be synced
- Done 🙌

## Current drawbacks

- Only works with one nesting level of JSON -> tolgee keys like `menu.button.title` will not work
- Because Figma defaults to Auto-Renaming Text Nodes, one has to edit the name of the TextNode manually instead of editing their value

<br>

Let us know what you think! #feedbackwanted ❤️
