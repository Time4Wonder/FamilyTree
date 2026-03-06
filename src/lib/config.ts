import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data-config.json');

export function getDataPath(): string | null {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const config = JSON.parse(data);
      return config.dataPath || null;
    }
    return null;
  } catch (e) {
    console.warn("Failed to read config", e);
    return null;
  }
}

export function setDataPath(newPath: string) {
  const config = { dataPath: newPath };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
