const electron = require('electron')
const {app, dialog, BrowserWindow} = require('electron')
const options = require('./options')
const path = require('path')
const url = require('url')

var mainWindow = null

function selectDisplay(displayID) {
    
    if(displayID == null) displayID = options.getTargetDisplayID()

    // Get all Display Informations
    var displays = electron.screen.getAllDisplays()
    let display = null
    displays.forEach( (d) => {
        if(d.id === displayID){
            display = d
            options.setTargetDisplayID(d.id)
        }
    })

    if( display == null) {
        display = electron.screen.getPrimaryDisplay()
        options.setTargetDisplayID(display.id)
    }

    return display
}

function getCurrentDisplayWorkArea(){
    return selectDisplay().workArea
}

  
function createWindow (display) {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        x: display.workArea.x, 
        y: display.workArea.y, 
        width: display.workArea.width , 
        height: display.workArea.height, 
        frame: false,})
  
    // and load the index.html of the app.
    //mainWindow.loadURL(options.getTargetSite())
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'view', '2018', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    
    mainWindow.on('closed', () => {
        app.quit()
    })

    mainWindow.on('move', () => {
        var c = mainWindow.getBounds()
        var workArea = getCurrentDisplayWorkArea()
        // 가끔 Resize가 이상하게 적용 될 경우가 있음 (보정해주기)
        if( workArea.x != c.x || workArea.y != c.y ){
            setTimeout( () => mainWindow.setBounds(workArea), 500)
        }
    })
    mainWindow.focus()

    setTimeout( () => mainWindow.setBounds(display.workArea), 500)
}

function onReady() {
    // Load Options
    options.init()

    // Parameter parse
    var argv = require('minimist')(process.argv.slice(2));
    var displayID = argv.display_id

    StartApplication(displayID)
}

function StartApplication(displayID) {


    // user task
    // Generate Select display
    var displays = electron.screen.getAllDisplays()
    var userTasks = displays.map( ( d, i ) => {
        return {
            program: process.execPath,
            arguments: '--display_id ' + d.id,
            iconPath: process.execPath,
            iconIndex: 0,
            title: 'Display' + i,
            description: 'select display',
        }
    })

    // add Change Site
    userTasks.push( {
        program: "%windir%\\system32\\notepad.exe",
        arguments: options.getConfigFilePath(),
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'Change Site',
        description: 'Change Site',
    })

    userTasks.push( {
        program: process.execPath,
        arguments: '--reload 1',
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'Reload',
        description: 'reload',
    })

    app.setUserTasks(userTasks)

    // show window
    display = selectDisplay(displayID)
    createWindow(display)
}

// Set single Instance
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {

    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      // Change the display
      var argv = require('minimist')(commandLine.slice(1));

      if( argv.display_id != null) {
        display = selectDisplay(argv.display_id)
        mainWindow.setBounds( getCurrentDisplayWorkArea() )
        mainWindow.focus();
      }
      if( argv.reload != null) {
        app.relaunch()
        app.exit(0)
      }
      
    }
  });
  
  if (shouldQuit) {
    app.quit();
    return;
  }
  

app.on('ready', onReady)