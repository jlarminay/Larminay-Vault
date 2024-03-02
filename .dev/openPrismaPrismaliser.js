#!/usr/bin/env node
import { readFileSync } from 'fs';
import cp from 'child_process';

function openUrl(port) {
  const data = btoa(readFileSync('./prisma/schema.prisma', 'utf8'));
  console.log('data.length', data.length);
  const start =
    process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';

  const link = `http://localhost:${port}/?code=${data}`;

  // cp.exec(`${start} ${link}`);
  // console.log('open', start);
  console.log('link', `\u001b]8;;${link}\u0007${link.substring(0, 50)}\u001b]8;;\u0007`);
}

let port = 5556;
openUrl(port);
