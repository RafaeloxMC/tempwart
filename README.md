# Tempwart

Struggling with spam mails? Tempwart is here for your rescue!

## What is this?

Tempwart is a browser extension that allows you to easily create aliases for your email addresses hosted on [Stalwart](https://github.com/stalwartlabs/stalwart), a self-hostable mail server.

## The Concept

Imagine you get spam mails. They annoy you. You try to get rid of them somehow, but it feels like they never stop. The solution: self-host your email and create a new email alias for each service you use.

Think of this like disposable emails:

1. Create your main email, ex. `johndoe@example.com`
2. Create your accounts on the platforms you need using Tempwart aliases, ex. `netflix@example.com`, `amazon@example.com`
3. An email is compromised? Just delete the alias and your main address will be perfectly fine!
4. Never worry about spam mails again!

## Tech Used

To create TempWart, I used TypeScript and Mozillas [`web-ext`](https://github.com/mozilla/web-ext). The content of the extension itself is written in plain HTML and CSS. The TypeScript code is being compiled to JavaScript.

## Running it locally

The steps are straightforward and pretty similar to every other TypeScript project. You will need to install [bun](https://bun.sh) if you don't have it already!

```bash
git clone https://github.com/RafaeloxMC/tempwart.git
cd tempwart
bun install
bun run dev
```

## Compiling the extension

Follow these simple steps to compile the extension:

```bash
bun run build

# Firefox
bunx web-ext lint --source-dir dist
bunx web-ext build --source-dir dist --artifacts-dir web-ext-artifacts

# For Chrome:
cd dist && zip -r ../tempwart-chrome.zip .
```

A Firefox browser window will open with the extension already installed for you! To use it, open the pop-up window by clicking the puzzle icon in your browsers navigation bar (on the right side of the URL bar).
