# VSC Shaperner: Unfuck your VS Code

## Instructions

1. Download the code: [vsc-sharpener-master.zip](https://github.com/nicholaspaun/vsc-sharpener/archive/master.zip).
2. Unzip it.
3. **Disable Auto Updates or it'll break again!**
4. **Close VS Code**.
5. Run `./install.sh`.
  * (In the `vsc-sharpener-master/` directory.)
6. Open VS Code.

## How it works

`vsc-sharpener` works by monkey-patching the Ionide extension for F# to call a shell script wrapper around FSI (FSharp Interactive). The wrapper creates an initialization file that opens the module declared in your code file and (optionally) any modules your code file opens. When FSI quits, the wrapper restarts it so that you can reload your code anytime by pressing `CTRL+D` in the terminal (Note for Mac users: `CTRL` != `Command`). 

You can also use `fsiw` separately from the command-line, like this `fsiw your-code.fs`.

**NOTE:** The installation process replaces the existing Ionide extension, installs the wrapper script and updates your path to allow it to run if necessary. If that sounds really hacky, that's because it is.

## Notes

* `vsc-sharpener` tries to identify itself so if something breaks later, you won't be entirely lost as to where to look.
* To quit FSI, click on the trash can icon.
* You can start a FSI terminal by typing `CTRL+P` then `> fsi start` then `ENTER`. 
* To save time, you can bind `fsi.Start` to a useful shortcut.
* Some weird stuff will get typed when you change tabs. Just ignore it. You can type at the prompt without issue.
* If you open a different file, you need to restart FSI to avoid issues. (i.e. '> fsi start`)

## Stuff it doesn't do

1. **Work on Windows** --> Consider installing Visual Studio Community Edition.
2. **Make types show up in your code if they didn't previously** --> No idea how to fix that.
3. **Realize that BSDs exist** --> Change the `/bin/bash` in `Fsi.js`, `install.sh` and `fsiw`.

## Contact me

Nicholas Paun <nicholas.paun@mail.mcgill.ca>

Also, check out my Minerva CLI Client <http://github.com/nicholaspaun/minervaclient>.
