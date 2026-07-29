// =========================================================
// VOCI DALL'ISOLA — genera automaticamente le card delle
// testimonianze a partire da:
//   voci/elenco.txt      → lista dei file da mostrare (uno per riga)
//   voci/<nome>.txt      → riga1: Nome, riga2: Azienda (può essere
//                          vuota), riga3: Anno, righe successive:
//                          il testo della testimonianza
//   voci/foto/<nome>.jpg → foto della persona (stesso nome del
//                          file .txt); se manca, si usa
//                          voci/foto/manichino.jpg
//
// Per aggiungere una nuova testimonianza: creare il file .txt
// in /voci, l'eventuale foto in /voci/foto con lo stesso nome,
// e aggiungere il nome del file a /voci/elenco.txt.
// =========================================================

(async function loadVoci() {
  const list = document.getElementById('vociList');
  if (!list) return;

  const FALLBACK_PHOTO = 'voci/foto/manichino.jpg';

  function baseName(fileName) {
    return fileName.replace(/\.txt$/i, '');
  }

  function parseEntry(raw) {
    const lines = raw.split('\n').map((l) => l.trim());
    const nome = lines[0] || '';
    const azienda = lines[1] || '';
    const anno = lines[2] || '';
    const testo = lines.slice(3).join(' ').trim();
    return { nome, azienda, anno, testo };
  }

  function buildCard(fileName, data) {
    const card = document.createElement('article');
    card.className = 'voci-card';

    const img = document.createElement('img');
    img.className = 'voci-photo';
    img.alt = data.nome;
    img.src = `voci/foto/${baseName(fileName)}.jpg`;
    img.onerror = () => {
      img.onerror = null;
      img.src = FALLBACK_PHOTO;
    };

    const info = document.createElement('div');
    info.className = 'voci-info';

    const name = document.createElement('p');
    name.className = 'voci-name';
    name.textContent = data.nome;
    info.appendChild(name);

    if (data.azienda) {
      const company = document.createElement('p');
      company.className = 'voci-company';
      company.textContent = `Isola ${data.azienda}`;
      info.appendChild(company);
    }

    if (data.anno) {
      const year = document.createElement('p');
      year.className = 'voci-year';
      year.textContent = data.anno;
      info.appendChild(year);
    }

    const text = document.createElement('p');
    text.className = 'voci-text';
    text.textContent = data.testo;

    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(text);
    return card;
  }

  try {
    const indexRes = await fetch('voci/elenco.txt');
    if (!indexRes.ok) throw new Error('Elenco non trovato');
    const indexText = await indexRes.text();
    const fileNames = indexText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (fileNames.length === 0) {
      list.innerHTML = '<p class="voci-loading">Nessuna testimonianza disponibile al momento.</p>';
      return;
    }

    list.innerHTML = '';

    for (const fileName of fileNames) {
      try {
        const res = await fetch(`voci/${fileName}`);
        if (!res.ok) continue;
        const raw = await res.text();
        const data = parseEntry(raw);
        list.appendChild(buildCard(fileName, data));
      } catch (err) {
        console.error('Errore caricando', fileName, err);
      }
    }
  } catch (err) {
    list.innerHTML = '<p class="voci-loading">Non è stato possibile caricare le testimonianze.</p>';
    console.error(err);
  }
})();
