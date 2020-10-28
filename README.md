# verifyjs
verifyjs is a simple Node.JS-based command-line program to verify javascript on Roll20 character sheets.

## usage
0. Clone the repository wherever you'd like.
0. Open your terminal to the installation directory
0. Run the following command: `npm install . -g`
0. Navigate to your javascript folder
0. Run `verifyjs ./`

You can watch for changes by using the `--watch` command.

Additionally, you can specify which files to track by typing their names. By default, verifyjs will scrape the given directory's `.js` files for you.

## debugging
If you'd like, you can open verifyjs in your preferred editor and use its built-in Node debugging tools. For VSCode, an example is provided. If you want to use this example, you will need to edit the `"args"` value in `launch.json`.

## limitations
Currently, only basic attributes are supported. I hope to integrate repeating sections and basic charactermancer support in the future.

__Importantly__, verifyjs does *not* connect to the Roll20 firebase and is *not* to be used for final testing, only for desktop-based debugging.
