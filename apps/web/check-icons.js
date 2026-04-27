const lucide = require('lucide-react');
const icons = ['Github', 'Linkedin', 'Twitter', 'Menu', 'X', 'ArrowRight', 'Check', 'Zap', 'Layers', 'Users', 'Lock', 'Eye', 'FileCheck', 'Shield', 'AlertCircle', 'Clock', 'Link2', 'Database', 'ShieldCheck', 'Smartphone', 'Globe', 'Wifi'];

icons.forEach(icon => {
  if (!lucide[icon]) {
    console.log(`Icon ${icon} is UNDEFINED`);
  } else {
    console.log(`Icon ${icon} is defined`);
  }
});
