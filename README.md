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
`mimic` is a simple Node.JS-based command-line program to verify javascript on Roll20 character sheets.

## usage
1. Clone the repository wherever you'd like.
1. Open your terminal to the installation directory
1. Run the following command: `npm install . -g`
1. Run `mimic $YOUR_DIRECTORY`

Additionally, you can specify which files to track by typing their names. By default, `mimic` will scrape directory for you.

`mimic` will read your `sheet.json` and scan your directory for HTML and translation files. I recommend running PUG alongside `mimic` for maximum efficiency.

### command line options
* `--watch` - Watch for changes
* `--verbose`/`-v` - Print additional logs - useful for debugging the `mimic` environment
* `--scrape $USERNAME $PASSWORD $COMPENDIUM_NAME` -- This will run a simple webscraper. It will log you into Roll20 and download all the pages for the given compendium.
* `--comp=$COMPENDIUM_NAME` - Manually sets the compendium.

## debugging
If you'd like, you can open `mimic` in your preferred editor and use its built-in Node debugging tools. For VSCode, an example is provided. If you want to use this example, you will need to edit the `"args"` value in `launch.json`.

## features
* Emulation of Roll20's sheet workers and API.
* Full support of basic sheet editing API
* Full support of compendium functions.
* Partial support of charactermancer functions.

## limitations
__Importantly__, verifyjs does *not* connect to the Roll20 firebase and is *not* to be used for final testing, only for desktop-based debugging.

At the moment repeating sections and full charactermancer support are *in progress*.