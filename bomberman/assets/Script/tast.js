var testArr = new Array();

testArr.push(1);
testArr.push(2);

// console.log(testArr.shift());
// console.log(testArr.shift());

var arr = new Array("left", "right", "top", "down");
// console.log(arr);
function shuffle(arr){
    for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
}
    
// console.log(shuffle(arr));

// Array.prototype.test = function(){
//     console.log("array test");
// }

var arr = new Array();
for(var index in arr)
    console.log(index);

console.log(arr.length);