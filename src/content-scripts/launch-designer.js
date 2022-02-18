import { getFileURL } from '@/utils/browser-interfaces/file-management.js';

var elt = document.createElement('script');
elt.src = getFileURL('/public/launch-designer.js');
document.head.appendChild(elt);
