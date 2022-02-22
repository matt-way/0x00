# 0x00 (NULL)

![null screenshot](screenshot.png)

## What is this?

Null is a new type of javascript IDE whose goal is to help you get your ideas to working code as fast as possible. It borrows elements from all sorts of different coding environments, but they key features are:

- Code is data driven, responding to changes from other code blocks.
- Code blocks have a persistent state, so you can change and run your code on the fly.
- Code blocks can be uploaded and shared (similar to npm, but higher specificity)
- Interactive properties can be created (eg. sliders, color and file pickers, etc).
- npm modules can be installed instantly for any block

## Installation / Setup

Currently there is no production build for Null, so below is how to get started using the dev environment.

```
clone the repo

npm install

npm run dev
```

Note that there are 3 concurrent processes running for this project. The first is the UI thread, which handles the IDE front end. The second is the Engine thread. This handles running the programs you create. The third is the electron app itself, housing everything. Each of these processes can be run independently if you want better logging in the console.
