# mimic
```
                        yy■■■■■■■■■■■■■■yy                      
                   yy■■yyyyyyyyyyyyyyyyyyyy■■■■y                
              ■■yyyyyyyyyy          yyyyyyyyyyyy■■■■y           
          ■■■■yyyyyyyyyy  ■■■■■■■■■■  yyyyyyyyyyyyyy■■y        
       y■■yyyyyyyyyyyy  ■■■■      ■■■■  yyyyyyyyyyyyyy■■        
     y■■yyyyyyyyyyyy  ■■■■          ■■■■  yyyyyyyyyyyyyy■■      
    ■■yyyyyyyyyyyyyy  ■■■■■■      ■■■■■■  yyyyyyyyyyyyyy■■      
  ■■yyyyyyyyyyyyyyyyyy  ■■■■■■■■■■■■    yyyyyyyyyyyyyyyy■■      
  ■■yyyyyyyyyyyyyyyyyyyy                            yyyyyy      
  ■■yyyyyyyyyyyyyyyy        ■■■■  ■■■■■■■■yy  ■■■■■■    yyyy    
    ■■yyyyyyyy      ■■  ■■yy■■■■  ■■yy■■■■    ■■yy■■  yy        
    yyyy      ■■■■■■    ■■yy■■■■    ■■■■        ■■■■  yy        
    yy  yy■■■■yy■■■■      ■■yy■■    ■■    ■■    ■■              
  yy  ■■■■  ■■yy■■          ■■          ■■■■        ■■          
      ■■      ■■      ■■                ■■■■■■      ■■■■        
          ■■  ■■    ■■■■                ■■yy■■    ■■yy■■yy      
          ■■      ■■■■yy■■  ■■  yyyy  yy■■yyyy  ■■yyyy■■  yyyy  
          ■■■■  ■■■■■■yy  ■■  yy■■■■yy                    yy    
          ■■yy■■■■■■yy    ■■  yy■■■■■■    yyyyyyyyyyyyyyyyyy    
        yy■■■■        yyyy  ■■  ■■■■■■■■  yyyyyyyyyyyyyyyy■■    
              yyyyyyyyyyyyyy  ■■yy■■■■■■  yyyy    yyyyyyyy■■    
        yyyyyyyyyyyyyyyyyyyy  ■■  yy■■■■■■    ■■■■  yyyy■■      
      yyyy■■■■yyyyyyyyyyyyyyyy  ■■  yy■■■■■■■■  yy■■  yy■■      
            ■■■■yyyyyyyyyyyyyyyy  ■■  yyyyyy  ■■        ■■      
              ■■yyyyyyyyyyyyyyyyyy  ■■      ■■    ■■  ■■■■      
              ■■yyyyyyyyyy            ■■■■■■      ■■      ■■    
                ■■yyyy    ■■■■■■■■■■            ■■  yy          
                ■■yy  ■■■■                      ■■yyyy          
                ■■  ■■                          ■■yyyy          
                ■■■■                              ■■            
              ■■                                                
```
mimic is a simple Node-based command-line program to debug Roll20 character sheets on your desktop.

## motivation
Constantly uploading your sheets to the web server can be a tedious and unreliable process. Additionally, some complex sheets require advanced debugging that the virtual machine on the Roll20 server simply can't handle. For these cases, consider using mimic.

## features
* Emulation of Roll20's sheet workers API in a virtual DOM environment.
* Full support for basic sheet editing functions.
* Full support for compendium functions.
* Full support for charactermancer functions
* Full support for repeating section functions
* Full support for HTML manipulation with [jsdom](https://github.com/jsdom/jsdom)

## limitations
__Importantly, mimic does *not* connect to the Roll20 servers and is *not* to be used for final testing. Only use mimic for desktop-based debugging.__

Additionally, scripts loaded into `mimic` are *not* guaranteed to run in the order they are loaded into your HTML. This is because mimic *removes* any scripts from the HTML before running. This is done to keep runtimes fast. We may introduce a simple `mimic.json` file in the future to offer environment settings, including script execution order.

Additionally, mimic currently only supports loading *one* character sheet at a time.

mimic does not and will never have built-in support for drag'n'drop functionality, roll templates, or virtual tabletop emulation. This program is for character sheets only.

## usage
1. Clone the repository wherever you'd like.
1. Open your terminal to the installation directory
1. Run the following command: `npm install . -g`
1. Run `mimic $YOUR_DIRECTORY`

Additionally, you can specify which files to track by typing their names. By default, mimic will scrape the directory for you. The order of exeuction of the scraped files is not guaranteed. If you need to run scripts in order, specify them in the required order on the command line.

mimic will read your `sheet.json` and scan your directory for HTML and translation files. Additionally, it will search for the relevant compendium cache.

Note that mimic will remove all sheet worker javascript from your sheets. This is so you can include test suites from other files. If you intend to do this, be sure to __undefine mimic in your HTML file.__ Check out the included test sheet for further details.

I recommend simultaneously running [pug](https://pugjs.org/api/getting-started.html) to generate HTML, [sass](https://sass-lang.com/) to generate CSS, and mimic to test JavaScript.

### command line options
* `--watch` - Watch for changes
* `--verbose`/`-v` - Print additional logs - useful for debugging the `mimic` environment
* `--scrape $USERNAME $PASSWORD $COMPENDIUM_NAME` -- This will run a [simple webscraper.](#scraping)
* `--comp=$COMPENDIUM_NAME` - Manually sets the compendium.
* `--noimg` - Supress the startup graphic

### the `mimic` object: testing, debugging, and DOM manipulation
Testing with mimic is as easy as using the `mimic` object to call functions. No additional includes or definitions necessary.

I recommend adding a `test.js` file to your workspace so you can run unit tests on your sheet. The `mimic` object has a number of in-built functions to facilitate quick and easy unit testing.

If you need more advanced control, no worries! You have direct access to `_` as well as `dom`, `document`, and `window` using the typical (jsdom) syntax.

Events passed to mimic take the following structure:
```js
event = {
    eventname: "name of the triggered event",
    mancer: "page|mancer|finish|cancel",
    oattr: "turns into info.sourceAttribute",
    sourcetype: "player|worker",
    //the below are optional:
    currentstep: "The current charactermancer step.",
    previous_value: "previous value (for updating attrs)",
    updated_value: "the new value (for updating attrs)",
    removed_info: "unused",
    triggerType: "unused",
    sourceSection: "the containing repeating section",
}
```

...And here is an example of the API in action:
```js
if (mimic) {
  mimic.triggerEvent("sheet:opened");
  mimic.enqueueEvent({
    eventname: "clicked:button",
    mancer: false,
    oattr: "some_class",
    sourcetype: "player"
  });
  mimic.addRepeatingSections("inventory");
  mimic.updateEvents();
}
```

### Debugging
Although mimic uses Node's `vm` environment to run sheet scripts, debugging with mimic is relatively straightforward. I personally use VSCode to run tests on mimic. Because the `vm` environment cannot be scanned for text-editor's debugger symbols, you will need to place the keyword `debugger;` wherever you need a sheet script to break. Unfortunately, VSCode has a tendency to keep these symbols around in the VM even when you remove them from the code. If this happens, simply restart mimic and the problem will fix itself.


### compendium scraping
Running `mimic --scrape` will download all the pages for the passed compendium. It uses [nightmarejs](http://www.nightmarejs.org/) to log you into Roll20 and manually scrapes the relevant pages. The scraped files will be saved in a cache in your install directory. Don't lose it!

__Because --scrape requires a log-in, if you don't have a Roll20 Pro account you probably won't have access to this feature. Sorry.__
Additionally, because we do not have access to the Roll20 backend, this process can be quite slow for larger compendiums. Use this if you need a coffee break :)

### watching for changes
Running `mimic --watch` will allow mimic to keep running in the background, watching for file changes. This includes automatically updating the DOM when HTML changes are made.

mimic will need to be restarted to find new files. This may change when we add `mimic.json`.

### debugging `mimic`
If you'd like, you can open `mimic` in your preferred editor and use its built-in Node debugging tools. For VSCode, an example is provided. If you want to use this example, you will need to edit the `"args"` value in `launch.json`.

## contribution
Feel free to contribute to this project! Development is active in the `dev` branch. And, if you come across any bugs, *please* submit an issue. 

## Possible Future Features
* mimic.json environment settings
* improved compendium scraping
* visual sheet testing GUI using electron

## license
```
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
