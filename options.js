const {getUserHome} = require("./util")
const fs = require('fs')

const configHome = getUserHome() + "\\" + ".desktopWallPaper"
const configFilePath = configHome + "\\config.json"
var savedOptions = {
    options: {
        targetDisplayID: 0,
        targetSite: "https://google.com"
    }
}

function checkUserHomeStatus() {
    if(!fs.existsSync(configHome)){
        // create that path
        return fs.mkdirSync(configHome)
    }
    return true
}

function loadOptions() {
    if(!checkUserHomeStatus()) return false

    if(!fs.existsSync(configFilePath)) {
        saveOptions()
    } else {
        opt = fs.readFileSync(configFilePath)
        savedOptions.options = JSON.parse(opt.toString())
    }
    
    return true
}
function saveOptions() {
    if(!checkUserHomeStatus()) return false
    return fs.writeFileSync(
            configFilePath, 
            JSON.stringify(savedOptions.options), 
            {encoding:'utf8',flag:'w'}
        )
}


module.exports = {
    init : () => loadOptions(),
    reload: () => loadOptions(),
    getTargetDisplayID: () => savedOptions.options.targetDisplayID,
    setTargetDisplayID: (id) => { savedOptions.options.targetDisplayID = id; saveOptions() }, 
    getTargetSite: () => savedOptions.options.targetSite,
    getConfigFilePath: () => configFilePath,
}