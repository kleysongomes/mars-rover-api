require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { URLSearchParams } = require('url');
const app = express();

const PORT = 3000;
const BASE_URL = 'https://api.nasa.gov/mars-photos/api/v1/rovers/';

const CONSULTAS_FILE = './consultas.json';

// Mapeamento das câmeras disponíveis por rover
const cameraMap = {
  FHAZ: { nome: 'Câmera de prevenção de riscos frontal', curiosity: true, opportunity: true, spirit: true },
  RHAZ: { nome: 'Câmera de prevenção de riscos traseira', curiosity: true, opportunity: true, spirit: true },
  MAST: { nome: 'Câmera de mastro', curiosity: true },
  CHEMCAM: { nome: 'Química e Complexo de Câmera', curiosity: true },
  MAHLI: { nome: 'Imagem de lente de mão de Marte', curiosity: true },
  MARDI: { nome: 'Gerador de Imagens da Descida de Marte', curiosity: true },
  NAVCAM: { nome: 'Câmera de navegação', curiosity: true, opportunity: true, spirit: true },
  PANCAM: { nome: 'Câmera panorâmica', opportunity: true, spirit: true },
  MINITES: { nome: 'Espectrômetro de emissão térmica em miniatura', opportunity: true, spirit: true }
};

const validRovers = ['curiosity', 'opportunity', 'spirit'];

// ROTA DE BUSCA DE FOTOS
app.get('/mars/photos', async (req, res) => {
  const { rover, sol, camera, page = 1, chave_api } = req.query;
  const apiKey = chave_api || process.env.NASA_API_KEY;

  // Validações
  if (!rover || !validRovers.includes(rover.toLowerCase())) {
    return res.status(400).json({ erro: `Parâmetro "rover" é obrigatório e deve ser um dos: ${validRovers.join(', ')}` });
  }
  if (!sol) {
    return res.status(400).json({ erro: 'Parâmetro "sol" é obrigatório.' });
  }
  if (camera) {
    const cameraUpper = camera.toUpperCase();
    if (!cameraMap[cameraUpper]) {
      return res.status(400).json({ erro: `Câmera inválida. Use uma das seguintes: ${Object.keys(cameraMap).join(', ')}` });
    }
    if (!cameraMap[cameraUpper][rover.toLowerCase()]) {
      return res.status(400).json({ erro: `A câmera "${cameraUpper}" não está disponível para o rover "${rover}"` });
    }
  }

  try {
    // Chamada para API da NASA
    const response = await axios.get(`${BASE_URL}${rover}/photos`, {
      params: {
        sol,
        camera,
        page,
        api_key: apiKey
      }
    });

    const fotos = response.data.photos.map(foto => ({
      id: foto.id,
      img_src: foto.img_src,
      earth_date: foto.earth_date,
      camera: foto.camera.full_name,
      rover: foto.rover.name
    }));

    const queryString = new URLSearchParams({
        rover,
        sol,
        ...(camera && { camera }),
        page,
        chave_api: 'API_KEY_**************'
    }).toString();

    const fullURL = `http://localhost:${PORT}/mars/photos?${queryString}`;

    // Registrar consulta no arquivo .json
    salvarConsulta({
      data: new Date().toISOString(),
      rover,
      sol,
      camera: camera || 'todas',
      page,
      total: fotos.length,
      url: fullURL
    });

    res.json({
      total: fotos.length,
      resultados: fotos
    });

  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar a API da NASA', detalhe: err.message });
  }
});

// ROTA DE CÂMERAS DISPONÍVEIS
app.get('/mars/cameras', (req, res) => {
  const resultado = Object.entries(cameraMap).map(([sigla, dados]) => ({
    sigla,
    nome: dados.nome,
    disponível_em: [
      ...(dados.curiosity ? ['Curiosity'] : []),
      ...(dados.opportunity ? ['Opportunity'] : []),
      ...(dados.spirit ? ['Spirit'] : [])
    ]
  }));

  res.json({ total: resultado.length, cameras: resultado });
});

// ROTA DE CONSULTAS RECENTES
app.get('/mars/consultas', (req, res) => {
  if (!fs.existsSync(CONSULTAS_FILE)) {
    return res.json([]);
  }

  const data = fs.readFileSync(CONSULTAS_FILE, 'utf8');
  const consultas = JSON.parse(data);
  res.json(consultas);
});

// Função auxiliar para salvar a consulta em um arquivo .json
function salvarConsulta(consulta) {
  let consultas = [];
  if (fs.existsSync(CONSULTAS_FILE)) {
    const data = fs.readFileSync(CONSULTAS_FILE, 'utf8');
    consultas = JSON.parse(data);
  }

  // Limitamos às últimas 50
  consultas.unshift(consulta);
  consultas = consultas.slice(0, 10);

  fs.writeFileSync(CONSULTAS_FILE, JSON.stringify(consultas, null, 2));
}

app.listen(PORT, () => {
  console.log(`🛰️ API Mars Rover rodando em http://localhost:${PORT}`);
});
