import https from 'https';

function getUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function checkRedirected() {
  const urls = [
    'https://medhaloud.com/عطر-luxury/p1907815091',
    'https://medhaloud.com/عطر-magic/p505349671',
    'https://medhaloud.com/معطر-رويال/p398134387',
  ];

  for (const u of urls) {
    const html = await getUrl(u);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const ogImg = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1];
    const price = html.match(/product:price:amount"\s+content="([^"]+)"/i)?.[1] ||
                  html.match(/"price":\s*"?([\d.]+)"?/)?.[1];
    console.log(`URL: ${u}`);
    console.log(`  Title: ${title}`);
    console.log(`  Price: ${price}`);
    console.log(`  Image: ${ogImg}`);
  }
}

checkRedirected();
