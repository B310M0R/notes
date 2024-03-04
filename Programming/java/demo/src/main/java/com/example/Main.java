package com.example;
// package is a kind of referrence to foldser in which we keep our class. All classes inside package could call one another

import java.util.Scanner;
//import Scanner for retrieveing user input

class Main {
    public static void main(String[] args) {
        System.out.println("Hello world");
        System.out.print("New line ");
        System.out.println("Not a new line ");

        int num1;
        num1 = 42;
        int num2 = 1337;

        System.out.println("Best number is: " + num1);
        num1 = num2;
        System.out.println("Number changed to " + num1);
        
        // Scanner scan = new Scanner(System.in);
        // System.out.println("Provide some text: ");
        // String input = scan.nextLine();
        // System.out.println("Input is: " + input);

        // System.out.println("Provide some number: ");
        // int input_num = scan.nextInt();
        // System.out.println("Input is: " + input_num);

        Scanner math_scanner = new Scanner(System.in);
        System.out.println("Enter 1st number: ");
        num1 = math_scanner.nextInt();
        System.out.println("Enter 2nd number: ");
        num2 = math_scanner.nextInt();
        System.out.println("Result is " + (num1 + num2));

        int res = num1 + num2;

        if(res % 2 == 0) {
            System.out.println("Result is even");
        } else {
            System.out.println("Result is odd");
        }
    }
}
//usually classes are named same as file
// code inside {} is referrenced to a class
// main() is a funciton. Code of function is also placed inside {}
// args is a name of parameters which be passed into a func
// System is a built-inb class. out is an object of System class. print() is a function of out object\
// println will add a new line chaaracter at end, but simple print won't
// special characters: \n (newline), \t (tab), \ (escape). // - one-line comment, /**/ - multi-line comment
// int num; - EMPTY variable with type integer. 
// data types for numbers are byte, short, int and long. They have different ranges (from smallest to biggest) for numbers that could be placed inside them. The difference is that different data types occupy different amount of memory
// data types for floats: float (4-byte), double (8-byte)
// string data types: char (1 symbol only in single quotes), String (lot of symbols, double quotes)
// boolean - true/false

//Scanner scan - here we sue class Scanner as data type and create object with name scan based on class Scanner
// = new Scanner(System.in) - we create space in memory for this object and mention it's class Scanner() and pass arguments System.in to make it work with input stream
// nextLine() gives us possibility to read user's input. nextInt, nextByte etc is used for int input
// we can output math operations without assigning a "result variable" with (var1 + var2)

// if structure:
/* \
if(condition) {
        code
    } else if(condition) {
        code2
    } else {
        code3
    }
Also we can use only first {} after first if and omit all another
*/

//switch-case structure:
/*
switch(variable) {
    case <case>: code; break;
    default: code to be executed if all cases are false
}
 */
// Case is never used with conditions or operators. It only checks for equality of variable to some value.
