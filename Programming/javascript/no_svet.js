//Arrays
// two same arrya won't be equal, because they are objects and under rhe hood they are just links to objects, that always differ

let myArray = []
myArray1 = []

equality = (myArray === myArray1)
console.log(equality)

myArray2 = myArray
equality = (myArray === myArray2)
console.log(equality)
// array2 is a link to an first array, so they are equal. But to created arrays are different even if they look simple, because they are objects

myArray.length = 7
console.log(myArray)
// we can manually change length of array and it will add empty elements

myArray[0] = 'abc'
myArray.length = 1
console.log(myArray)

myArray.push(1337) // add element to array
console.log(myArray)

myArray.pop()   // delete element from array
console.log(myArray)

let removedElement = myArray.pop()
console.log(myArray)
console.log(removedElement)

myArray = [1, 2, 3, 4, 5]
myArray.unshift(0)  // add element to beginning of array
console.log(myArray)

removedElement = myArray.shift() // delete first element of array
console.log(myArray)
console.log(removedElement)

//all array methods are mutating original array

myArray.forEach(el => console.log(el * 2))
console.log(myArray)
//forEach does operations with array elements, but doesn't change array

const newArray = myArray.map(el => el * 3)
console.log(myArray)
console.log(newArray)
//difference between map and forEach is that map RETURNS new modified array, while forEach only processes elements

