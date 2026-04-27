const lucide = require('lucide-react');
const icons = [
  'AlertCircle', 'Clock', 'Link2', 'Database',
  'Zap', 'Layers', 'Users',
  'ShieldCheck', 'Smartphone', 'Globe', 'Lock',
  'CheckCircle', 'Wifi',
  'Eye', 'FileCheck', 'Shield',
  'CheckSquare', 'Truck',
  'Check', 'ArrowRight', 'Menu', 'X', 'Mail'
];

icons.forEach(icon => {
  if (!lucide[icon]) console.log(`CRITICAL: Icon ${icon} is UNDEFINED`);
});
console.log('Check complete.');
