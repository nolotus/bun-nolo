export const readFile =async ()=>{
const example =Bun.file('example.txt')
const text = await example.text()
return text
}