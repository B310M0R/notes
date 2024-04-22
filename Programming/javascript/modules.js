// Modules
// modules are code in files that could be imported to other files with import/export syntax
// file 1
const myName = () => {
    console.log('Denys')
}
export default myName

// file 2
import importedName from 'modules.js'
//importedName() - this will throw error because we need to import typescript module in package.json
// names of imported entities could differ becuase of default keyword
// also we can change extension of file to .mjs to use import/export syntax

export {
    one,
    two
}

import {
    one,
    two
} from './file.js'
// multiple export

//if we export without default keywortd and want to change name of imported entity we can use "import smth as anyth"
