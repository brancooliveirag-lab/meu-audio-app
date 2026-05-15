const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const PASTA_AUDIOS = path.join(__dirname, 'audios');
if (!fs.existsSync(PASTA_AUDIOS)) fs.mkdirSync(PASTA_AUDIOS, { recursive: true });

const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PASTA_AUDIOS),
  filename: (req, file, cb) => {
    const nomeUnico = new Date().toISOString().replace(/[:.]/g, '-') + '_' + file.originalname;
    cb(null, nomeUnico);
  }
});
const upload = multer({ storage: armazenamento });

app.post('/upload', upload.single('arquivo'), (req, res) => {
  if (!req.file) return res.status(400).send('Erro: Nenhum arquivo enviado');
  res.send('✅ Arquivo recebido: ' + req.file.filename);
});

app.get('/', (req, res) => {
  fs.readdir(PASTA_AUDIOS, (err, arquivos) => {
    if (err) return res.status(500).send('Erro ao ler arquivos');

    let listaHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Meus Áudios ao Vivo</title>
        <style>
            body { font-family: Arial; padding: 20px; background: #f5f5f5; }
            h1 { color: #333; }
            .audio-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            audio { width: 100%; margin-top: 8px; }
        </style>
    </head>
    <body>
        <h1>🎙️ Áudios Recebidos (Ordem Cronológica)</h1>
    `;

    arquivos.sort((a,b) => b.localeCompare(a));

    arquivos.forEach(nomeArquivo => {
      const caminhoArquivo = '/audios/' + nomeArquivo;
      listaHTML += `
      <div class="audio-item">
          <strong>${nomeArquivo}</strong>
          <br>
          <audio controls>
              <source src="${caminhoArquivo}" type="audio/mpeg">
              Seu navegador não suporta áudio.
          
      </div>
      `;
    });

    listaHTML += `</body></html>`;
    res.send(listaHTML);
  });
});

app.use('/audios', express.static(PASTA_AUDIOS));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
