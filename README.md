# Tolgee Figma Plugin for Localization

![test workflow](https://github.com/tolgee/figma-plugin/actions/workflows/test.yml/badge.svg)
![licence](https://img.shields.io/github/license/tolgee/figma-plugin)
[![twitter](https://img.shields.io/twitter/follow/Tolgee_i18n?style=social)](https://twitter.com/Tolgee_i18n)
[![github stars](https://img.shields.io/github/stars/tolgee/figma-plugin?style=social)](https://github.com/tolgee/figma-plugin)
[![slack](https://img.shields.io/badge/slack-Tolgee%20community-blue)](https://tolg.ee/slack)

[<img src="https://raw.githubusercontent.com/tolgee/documentation/main/tolgee_logo_text.svg" alt="Tolgee" width="200" />](https://tolgee.io)


This repository contains the code for the Tolgee Figma Plugin.

![Screenshot Tolgee Figma Plugin](images/figma-plugin-banner.png)

Easily manage translations within your Figma design files by connecting Figma with Tolgee localization platform. With Tolgee’s Figma plugin, the localization team can save time, simplify collaboration, and reduce errors in their localization process.

## Additional information

To learn more visit [https://tolgee.io](https://tolgee.io)

👇 Concider supporting us with your stars ⭐️

[![github stars](https://img.shields.io/github/stars/tolgee/figma-plugin?style=social)](https://github.com/tolgee/figma-plugin) 

## Features

- Push seamlessly your translations from Figma to Tolgee
- Pull your translations from Tolgee back to your Figma designs
- Switch languages in your Figma designs
- Create page copies with key names or translations
- Upload screenshots

## Usage Guide

- Clone the repository and link it to your local Figma Desktop app
- Run the `Setup Tolgee` command and enter the URL of your Tolgee instance as well as well as an API key for the project with the `translations.edit` and `translations.view` scope.
- Name all nodes that should by synced by their tolgee key, prefixed by `t:``
- Run `Sync Tolgee to Figma` or `Sync Figma To Tolgee`
- Select all translations that should be synced
- Done 🙌

## Current drawbacks

- Only works with one nesting level of JSON -> tolgee keys like `menu.button.title` will not work
- Because Figma defaults to Auto-Renaming Text Nodes, one has to edit the name of the TextNode manually instead of editing their value

<br>

Let us know what you think! #feedbackwanted ❤️
