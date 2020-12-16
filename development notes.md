General structure:

# index.js - File Loading and The Global Environment
1. Boot up - route based on CLI arguments.
2. Scrape the given directory for relevant files and read them into a const array stored at the global scope.
3. Initialize the mimic environment.
4. Run the scripts in the mimic environment.
5. Watch for changes and re-run scripts accordingly.

# modules/mimic.js - The Mimic Environment
1. Initialize the mimic class.
    * This creates a const context object wherein all scripts will be called.
    * The context contains an exposed DOM and testing environment for users.
    * The class itself contains objects for attributes, repeating sections, and charactermancer data.
2. Initialize the message handler.
    * The message handler is the real meat of the project. It takes messages from `modules/r20workers.js` and manipulates the data accordingly.

# modules/messageHandler.js - Message Handling
1. Interprets messages.
    * No data is stored here - this is only a system for the data passed by the Mimic object.

# mancer structure
* mancer
* * pages
* * * repeatingSections
* * * * repeatingData