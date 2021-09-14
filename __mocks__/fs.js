const fs = jest.genMockFromModule("fs");
const path = require("path");
let mockFiles = Object.create(null);
// example of newMockFiles
// { "./testFolder/file1.txt": "This is the file content"
function __setMockFile(newMockFile) {
    mockFiles = Object.create(null);
    mockFiles[path.basename(newMockFile)] = newMockFile;
}

function existsSync(pathToDirectory){
    return mockFiles[pathToDirectory];
}
function readFileSync(path, encoding){

}

function writeFileSync(){
    
}

fs.existsSync = existsSync
fs.existsSync = readFileSync
fs.existsSync = writeFileSync
fs.__setMockFile = __setMockFile;
module.exports = fs;