const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(PORT, ()=>{
  console.log('Server listening on', PORT);
});
