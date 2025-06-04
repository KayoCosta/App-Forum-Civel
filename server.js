const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;

const midiaDir = path.join('Z:\\', 'Meu Drive', 'Pasta de teste');

app.use(express.static(path.join(__dirname)));

app.use('/midia', express.static(midiaDir));

app.get('/api/midia', (req, res) => {
  fs.readdir(midiaDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler a pasta de mídias' });
    }

    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm'];
    const list = files
      .filter(file => allowed.includes(path.extname(file).toLowerCase()))
      .map(file => encodeURIComponent(file));

    res.json(list);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
