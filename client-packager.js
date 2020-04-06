'use strict';
var packager = require('electron-packager');
var options = {
    'all': true,
    'dir': './client',
    'app-copyright': 'Gracie & Jeremy Glebe, Zach Kingcade',
    'app-version': '0.0.1',
    'asar': false,
    'extraResource': './assets',
    'icon': './app.ico',
    'name': 'SecretNecromancer',
    'out': './dist/client',
    'overwrite': true,
    'prune': true,
    'version': '0.0.1',
    'version-string': {
        'CompanyName': 'Gracie & Jeremy Glebe, Zach Kingcade',
        'FileDescription': 'Secret Necromancer multiplayer game', /*This is what display windows on task manager, shortcut and process*/
        'OriginalFilename': 'SecretNecromancer',
        'ProductName': 'SecretNecromancer',
        'InternalName': 'SecretNecromancer'
    }
};
packager(options, function done_callback(err, appPaths) {
    console.log("Error: ", err);
    console.log("appPaths: ", appPaths);
});