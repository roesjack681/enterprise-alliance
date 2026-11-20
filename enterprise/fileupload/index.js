import express from 'express';
import path from 'path';
import fse from 'fs-extra';
import bodyParser from 'body-parser';
import compression from 'compression';

const app = express();
const __dirname = path.resolve(path.dirname(''));
const UPLOAD_FILES_DIR = path.resolve(__dirname, './storage');
const baseUrl ="http://115.190.133.216:3001"
// 中间件配置
const jsonParser = bodyParser.json({ limit: '50mb', extended: false });
app.use(compression());//启用压缩
// 添加静态资源服务，让 /storage 路径能访问 storage 目录下的文件
app.use('/storage', express.static(UPLOAD_FILES_DIR, {
  maxAge: '30d', // 客户端缓存30天
  etag: true,    // 启用ETag缓存
  lastModified: true
}));
// 跨域配置
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  next();
});

// 保证上传目录存在
fse.ensureDirSync(UPLOAD_FILES_DIR);

/**
 * 获取已上传的分片列表
 * @param {string} project 项目名称
 * @param {string} fileHash 文件哈希值
 */
const getUploadedChunkList = async (project, fileHash) => {
  const chunksDir = path.resolve(UPLOAD_FILES_DIR, project, fileHash);
  return fse.existsSync(chunksDir)
    ? await fse.readdir(chunksDir)
    : [];
};

app.get('/', async (req, res) => {
  res.send('file server running!');
});

/**
 * 验证文件是否存在
 */
app.post('/verFileIsExist', jsonParser, async (req, res) => {
  try {
    const project = req.headers['x-project-name'];
    if (!project) {
      return res.status(400).json({
        code: 400,
        message: 'Missing project'
      });
    }
    const { fileHash, suffix } = req.body;
    
    if (!fileHash || !suffix || !project) {
      return res.status(400).json({
        code: 400,
        message: 'Missing fileHash, suffix, or project'
      });
    }

    const filePath = path.resolve(UPLOAD_FILES_DIR, project, `${fileHash}.${suffix}`);
    if (fse.existsSync(filePath)) {
      return res.json({
        code: 200,
        shouldUpload: false,
        filePath: `${baseUrl}/storage/${project}/${fileHash}.${suffix}`
      });
    }

    const uploadedChunkList = await getUploadedChunkList(project, fileHash);
    res.json({
      code: 200,
      shouldUpload: true,
      uploadedChunkList,
      uploadedSize: uploadedChunkList.length
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

/**
 * 合并文件分片
 * @param {string} project 项目名
 * @param {string} filePath 合并后的完整文件路径
 * @param {string} fileHash 文件哈希
 */
const mergeFileChunk = async (project, filePath, fileHash) => {
  const chunkDir = path.resolve(UPLOAD_FILES_DIR, project, fileHash);
  const chunkPaths = await fse.readdir(chunkDir);

  chunkPaths.sort((a, b) => parseInt(a) - parseInt(b));
  const writeStream = fse.createWriteStream(filePath);

  for (const chunkPath of chunkPaths) {
    const fullChunkPath = path.resolve(chunkDir, chunkPath);
    const base64Data = await fse.readFile(fullChunkPath, 'utf8');
    const buffer = Buffer.from(base64Data, 'base64');
    await new Promise(resolve => writeStream.write(buffer, resolve));
  }

  writeStream.end();
  await new Promise(resolve => writeStream.on('finish', resolve));

  await fse.remove(chunkDir);
};

/**
 * 上传文件分片 (Base64格式)
 */
app.post('/upload', jsonParser, async (req, res) => {
  try {
    const project = req.headers['x-project-name'];
    if (!project) {
      return res.status(400).json({
        code: 400,
        message: 'Missing project'
      });
    }
    const { chunk, hash, suffix, index, total } = req.body;

    if (!chunk || !hash || index === undefined || !total || !project) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required parameters'
      });
    }

    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(chunk)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid Base64 format'
      });
    }

    const fileHash = hash.split('-')[0];
    const chunksDir = path.resolve(UPLOAD_FILES_DIR, project, fileHash);
    await fse.ensureDir(chunksDir);

    await fse.writeFile(
      path.resolve(chunksDir, index.toString()),
      chunk,
      'utf8'
    );

    const uploadedChunks = await fse.readdir(chunksDir);
    const uploadedIndexes = uploadedChunks.map(Number);
    const missingIndexes = [];

    for (let i = 0; i < total; i++) {
      if (!uploadedIndexes.includes(i)) {
        missingIndexes.push(i);
      }
    }

    if (missingIndexes.length > 0) {
      return res.json({
        code: 206,
        message: 'Partial content received',
        missingIndexes
      });
    }

    const filePath = path.resolve(UPLOAD_FILES_DIR, project, `${fileHash}.${suffix}`);
    await mergeFileChunk(project, filePath, fileHash);

    res.json({
      code: 200,
      message: 'All chunks received and file merged',
      filePath: `${baseUrl}/storage/${project}/${fileHash}.${suffix}`
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      code: 500,
      message: err.message || 'Upload failed'
    });
  }
});

/**
 * 启动服务
 */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${UPLOAD_FILES_DIR}`);
});
