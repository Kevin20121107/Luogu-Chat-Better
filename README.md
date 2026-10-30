# Luogu-Chat-Better

## Introduction

Luogu Chat Better! is a userscript designed to improve the messaging experience on Luogu's private chat page.

When sending long messages, users may need to manually click the input box to focus it. LGCB solves this problem by automatically focusing the chat input box when appropriate, making conversations smoother and more convenient.

The script is abbreviated as `LGCB`, derived from the initials of its name.

## Features

- **Automatic Input Focus**: Automatically focuses the chat input box when the chat page loads, when a chat input box appears, and after sending a message.
- **Quote Reply**: Left-clicking a message opens a menu with quote and copy options. Quoting converts the message content into Markdown and inserts it into the chat input box.
- **Message Copying**: Quickly copies the text content of a message.
- **Image Display**: Supports displaying images in private chats when they are written using valid Markdown image syntax.
- **Message Styling**: Customizes message bubble colors, text colors, and rounded corners.

## Screenshot

![](https://cdn.luogu.com.cn/upload/image_hosting/7nj7lwu6.png)

## Download

Go to [releases](https://github.com/Kevin20121107/Luogu-Chat-Better/releases) to download the newest version.

## Usage

1. Open the Luogu private chat page.
2. Select a conversation and start messaging.
3. The input box will automatically receive focus when appropriate.
4. Left-click a message to open the action menu:
   - **Quote**: Inserts the message as a Markdown quote into the input box.
   - **Copy**: Copies the message's text content.
5. To display images, use Markdown image syntax:

   ```markdown
   ![Image description](https://example.com/image.png)
   ```

## Settings

At the beginning of the script, you can find the `CONFIG` object. Modify its values to customize the plugin's behavior.

| Configuration Item | Type | Default Value | Description |
| --- | --- | --- | --- |
| `enableOwnColor` | `boolean` | `true` | Whether to customize the background and text colors of your own messages |
| `ownBgColor` | `string` | `"#d9f0ff"` | Background color of your message bubbles |
| `ownTextColor` | `string` | `"#000000"` | Text color of your messages |
| `enableOwnRadius` | `boolean` | `true` | Whether to enable rounded corners for your messages |
| `enableOtherColor` | `boolean` | `false` | Whether to customize the other person's message colors |
| `otherBgColor` | `string` | `""` | Background color of the other person's message bubbles |
| `otherTextColor` | `string` | `""` | Text color of the other person's messages |
| `enableOtherRadius` | `boolean` | `true` | Whether to enable rounded corners for the other person's messages |
| `enableQuoteReply` | `boolean` | `true` | Whether to enable the message action menu, including quote and copy |
| `quoteSeparator` | `string` | `" \|\|"` | Separator inserted before quoted content |

### Notes

- Color values must use the hexadecimal format `#RRGGBB`.
- Setting `enableQuoteReply` to `false` disables the message action menu.
- Automatic input focus works independently of the quote and reply settings.

## Feedback

Thanks for using **Luogu Chat Better!**

If you encounter a bug or have a feature request, please create an [Issue](../../issues) on GitHub.

Contributions and suggestions are welcome!

---

Translated to English by ChatGPT.
