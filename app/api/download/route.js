import { spawn } from 'child_process';
import ytdl from 'ytdl-core';
import path from 'path';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !ytdl.validateURL(url)) {
    return new Response(JSON.stringify({ error: 'URL inválida' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[<>:"/\\|?*]+/g, '');

    const ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe');

    const ytDlpProcess = spawn(ytDlpPath, [
      url,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--output', '-',
    ]);

    return new Response(ytDlpProcess.stdout, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${title}.mp3"`,
      },
    });

  } catch (error) {
    console.error('Error al procesar la descarga:', error);
    return new Response(JSON.stringify({ error: 'Error procesando el video' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
