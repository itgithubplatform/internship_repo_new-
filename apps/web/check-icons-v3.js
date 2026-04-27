const lucide = require('lucide-react');
const all = Object.keys(lucide);
console.log('GitHub:', all.find(k => k.toLowerCase() === 'github'));
console.log('Linkedin:', all.find(k => k.toLowerCase() === 'linkedin'));
console.log('Twitter:', all.find(k => k.toLowerCase() === 'twitter'));
console.log('X:', all.find(k => k === 'X'));
