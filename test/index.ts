//must mock before
import 'mock-local-storage'
(global as any).window = {} as any;
(window as any).localStorage = global.localStorage;
global.XMLHttpRequest = require('xhr2');
(window as any).XMLHttpRequest = global.XMLHttpRequest;
global.btoa = require('btoa');
//load for ts-node
import 'tsconfig-paths/register';
//import
import "mocha";