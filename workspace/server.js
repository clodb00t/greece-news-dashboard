const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'PLACEHOLDER_ADMIN_TOKEN';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public API: latest generated brief
app.get('/api/news', (req, res) =>{
  const p = path.join(__dirname, 'news.json');
  if(fs.existsSync(p)){
    try{
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      return res.json(data);
    }catch(e){
      return res.status(500).json({error:'bad JSON'});
    }
  }
  res.json({generatedAt: null, highlight: 'No data yet', bullets: []});
});

// Helper: simple admin auth by token header 'x-admin-token'
function checkAdmin(req, res) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== ADMIN_TOKEN) {
    res.status(403).json({ error: 'forbidden' });
    return false;
  }
  return true;
}

// Admin endpoints (enabled when ADMIN_TOKEN is set to a non-placeholder value)
app.get('/api/admin/sources', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const p = path.join(__dirname, 'sources.json');
  try{
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    res.json(data);
  }catch(e){
    res.status(500).json({ error: 'failed to read sources' });
  }
});

app.post('/api/admin/sources', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const body = req.body;
  const p = path.join(__dirname, 'sources.json');
  try{
    fs.writeFileSync(p, JSON.stringify(body, null, 2), 'utf8');
    res.json({ ok: true });
  }catch(e){
    res.status(500).json({ error: 'failed to write sources' });
  }
});

app.get('/api/admin/settings', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const p = path.join(__dirname, 'settings.json');
  if (!fs.existsSync(p)) return res.json({});
  try{
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    res.json(data);
  }catch(e){
    res.status(500).json({ error: 'failed to read settings' });
  }
});

app.post('/api/admin/settings', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const body = req.body;
  const p = path.join(__dirname, 'settings.json');
  try{
    fs.writeFileSync(p, JSON.stringify(body, null, 2), 'utf8');
    res.json({ ok: true });
  }catch(e){
    res.status(500).json({ error: 'failed to write settings' });
  }
});

app.listen(PORT, ()=>{
  console.log('Server listening on', PORT);
});
