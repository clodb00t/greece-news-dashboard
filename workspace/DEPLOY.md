Deployment notes

This project is deployed on a VPS at news.stav.gr.

Systemd service: /etc/systemd/system/greece-news.service
Nginx site: /etc/nginx/sites-available/news.stav.gr
Cron: fetcher runs every 10 minutes via crontab.

To reproduce on another Ubuntu server:
1) Clone the repo
2) Install Node 24, npm, nginx, certbot
3) npm install in workspace/ directory
4) Create systemd service (see /deploy/greece-news.service)
5) Create nginx site and obtain TLS via certbot
6) Add crontab entry: */10 * * * * cd /path/to/workspace && /usr/bin/node fetcher.js >> fetcher.log 2>&1

Files below are examples used on the VPS.
