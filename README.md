# Tolgee Figma Plugin

![test workflow](https://github.com/tolgee/figma-plugin/actions/workflows/test.yml/badge.svg)
![types typescript](https://img.shields.io/badge/Types-Typescript-blue)
![licence](https://img.shields.io/github/license/tolgee/figma-plugin)
[![twitter](https://img.shields.io/twitter/follow/Tolgee_i18n?style=social)](https://twitter.com/Tolgee_i18n)
[![github stars](https://img.shields.io/github/stars/tolgee/figma-plugin?style=social)](https://github.com/tolgee/figma-plugin)
[![slack](https://img.shields.io/badge/slack-Tolgee%20community-blue)](https://tolg.ee/slack)

[<img src="https://raw.githubusercontent.com/tolgee/documentation/main/tolgee_logo_text.svg" alt="Tolgee" width="200" />](https://tolgee.io)

This repository contains the code for the Tolgee Figma Plugin.

It provides ability to easily manage localization texts directly in context of your Figma files.

To learn more visit [https://tolgee.io](https://tolgee.io)

## Features

- Sync changed translations from Figma to Tolgee 🙌
- Just change the text of your Figma TextNodes and sync them with Tolgee 🎉
- Sync translations back from Tolgee to Figma 🎈
- Open-source 🔥

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

## Launching Tolgee Rewards

Contributed to Tolgee? Here is a big thank you from our community to you.
Claim your badge and showcase them with pride.
Let us inspire more folks !

![Tolgee Badges](https://aviyel.com/assets/uploads/rewards/share/project/28/512/share.png)

### **[Claim Now!](https://aviyel.com/projects/28/tolgee/rewards)**

<br>

Let us know what you think! #feedbackwanted ❤️
