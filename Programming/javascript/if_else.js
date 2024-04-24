// Conditional instructions

let condition = 0

if (condition) {
    // code
} else if (condition) {
    // code
} else {
    // code
}

// best practice to write separate if instructions and don't use else if blocks

// switch
switch (expression) {
    case A:
        // code if expression === A
        break
    case B:
        // analogichno
        break
    default:
        // default code
}

// ternar zalupa
condition ? expression_1 : expression_2
// if condition true, expression_1 is returned
//it's better to use such syntax:
condition
? expression_1
: expression_2
