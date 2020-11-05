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
`mimic` is a simple Node.JS-based command-line program to debug Roll20 character sheets on your desktop.

## features
* Emulation of Roll20's sheet workers and API in a DOM environment.
* Full support for basic sheet editing functions.
* Full support for compendium functions.
* Full support for charactermancer functions (IN PROGRESS)
* Full support for repeating section functions (IN PROGRESS)
* Full support for HTML manipulation with [jsdom](https://github.com/jsdom/jsdom)

## limitations
__Importantly, `mimic` does *not* connect to the Roll20 servers and is *not* to be used for final testing, only for desktop-based debugging.__

Additionally, scripts loaded into `mimic` are *not* guaranteed to run in the order they are loaded into your HTML. This is because `mimic` *removes* any scripts from the HTML before running. This is done to keep runtimes fast. We may introduce a simple `mimic.json` file in the future to offer environment settings, including script execution order.

`mimic` does not and will never have in-built support for drag'n'drop functionality or virtual tabletop emulation. This program is for character sheets only.

## usage
1. Clone the repository wherever you'd like.
1. Open your terminal to the installation directory
1. Run the following command: `npm install . -g`
1. Run `mimic $YOUR_DIRECTORY`

Additionally, you can specify which files to track by typing their names. By default, `mimic` will scrape the directory for you.

`mimic` will read your `sheet.json` and scan your directory for HTML and translation files. I recommend running [pug](https://pugjs.org/api/getting-started.html) and [sass](https://sass-lang.com/) alongside `mimic` for maximum efficiency.

### the `mimic` object, testing, and DOM manipulation
Testing with `mimic` is as easy as using the `mimic` object to call functions. No additional includes or definitions necessary.

I recommend adding a `test.js` file to your workspace so you can run unit tests on your sheet. For example, you might want to check that all your action buttons are working properly. Use the in-built DOM functionality to pass MouseEvents to all your action buttons!

```js
//TODO: update this when the mimic object is real :)

console.log("TESTING SHEET CLICK EVENTS...");
dom.window.document.querySelectorAll("[type=action]").forEach((node)=>{node.dispatchEvent(new dom.window.MouseEvent("click"));});

console.log("TESTING CHARACTERMANCER CLICK EVENTS...");
startCharactermancer("welcome");
for (i in mancerPages) {
    changeCharmancerPage(mancerPages[i], ()=>{
        dom.window.document.querySelectorAll("[type=action]").forEach((node)=>{node.dispatchEvent(new dom.window.MouseEvent("click"));});
    });
}
finishCharactermancer();
```

### command line options
* `--watch` - Watch for changes
* `--verbose`/`-v` - Print additional logs - useful for debugging the `mimic` environment
* `--scrape $USERNAME $PASSWORD $COMPENDIUM_NAME` -- This will run a [simple webscraper.](#scraping)
* `--comp=$COMPENDIUM_NAME` - Manually sets the compendium.

### scraping
Running `mimic --scrape` will download all the pages for the passed compendium. It uses [nightmarejs](http://www.nightmarejs.org/) to log you into Roll20 and manually scrapes the relevant pages. The scraped files will be saved in a cache in your install directory. Don't lose it!

__Because --scrape requires a log-in, if you don't have a Roll20 Pro account you probably won't have access to this feature. Sorry.__
Additionally, because we do not have access to the Roll20 backend, this process can be quite slow for larger compendiums. Use this if you need a coffee break :)

### debugging `mimic`
If you'd like, you can open `mimic` in your preferred editor and use its built-in Node debugging tools. For VSCode, an example is provided. If you want to use this example, you will need to edit the `"args"` value in `launch.json`.

## contribution
Feel free to contribute to this project! Development is active in the `dev` branch. And, if you come across any bugs, *please* submit an issue. 

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