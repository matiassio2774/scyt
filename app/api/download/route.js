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

    // Descargar el audio completo a un buffer
    const audioChunks = [];
    const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

    // Almacenar los chunks en un array de buffers
    for await (const chunk of audioStream) {
      audioChunks.push(chunk);
    }

    // Combinar los chunks en un único buffer
    const audioBuffer = Buffer.concat(audioChunks);

    // Retornar el buffer como una respuesta
    return new Response(audioBuffer, {
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
