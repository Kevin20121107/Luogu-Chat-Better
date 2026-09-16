## Introduction

When sending long messages in Luogu private chats, you often have to click to focus the input box manually since it doesn't auto-focus, which hurts the messaging experience. That's why I made this plugin.

This plugin is abbreviated as `lgcb`, derived from its name initials.

## Screenshot

## Usage

* Left-clicking a message pops up a menu with copy and reply functions.
* Providing the correct image `Markdown` allows images to be displayed in private chats.
* Most other features are style optimizations.

---

## Settings

At the very beginning of the script, there is a designated block of code (already marked). You can modify the values of the parameters to achieve different effects.

| Configuration Item | Type | Default Value | Description |
| --- | --- | --- | --- |
| `enableOwnColor` | bool | `true` | Whether to enable color customization for your own messages |
| `ownBgColor` | string | `"#d9f0ff"` | Background color of your message bubbles |
| `ownTextColor` | string | `"#000000"` | Text color of your messages |
| `enableOwnRadius` | bool | `true` | Whether to apply rounded corners to your messages |
| `enableOtherColor` | bool | `false` | Whether to enable color customization for the other person's messages |
| `otherBgColor` | string | `""` (Luogu default) | Background color of the other person's message bubbles |
| `otherTextColor` | string | `""` (Luogu default) | Text color of the other person's messages |
| `enableOtherRadius` | bool | `true` | Whether to apply rounded corners to the other person's messages |
| `enableQuoteReply` | bool | `true` | Whether to enable the click-to-pop-up-menu function |
| `quoteSeparator` | string | `" ||"` | Separator inserted before the input box when quoting |

---

## Installation

You can install it using the following methods:

1. [https://github.com/Kevin20121107/Luogu-Chat-Better.git](https://github.com/Kevin20121107/Luogu-Chat-Better.git)
2. [https://www.luogu.com.cn/paste/nm978jz9](https://www.luogu.com.cn/paste/nm978jz9) (Backup)
