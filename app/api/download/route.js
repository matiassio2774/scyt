import ytdl from '@distube/ytdl-core';

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

    // Crear un stream de audio
    const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

    // Retornar el stream como una respuesta
    return new Response(audioStream, {
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
