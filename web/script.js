let provinces = [];
let districts = [];
let localLevels = [];

async function loadData() {
  provinces = await fetch('../provinces.json').then(res => res.json());
  districts = await fetch('../districts.json').then(res => res.json());
  localLevels = await fetch('../local_levels.json').then(res => res.json());
}

function search(query) {
  query = query.toLowerCase();
  const results = [];

  provinces.forEach(p => {
    if(p.name_en.toLowerCase().includes(query) || p.name_ne.includes(query)){
      results.push({type:'Province', name:p.name_en, nepali:p.name_ne});
    }
  });

  districts.forEach(d => {
    if(d.name_en.toLowerCase().includes(query) || d.name_ne.includes(query)){
      results.push({type:'District', name:d.name_en, nepali:d.name_ne});
    }
  });

  localLevels.forEach(l => {
    if(l.name_en.toLowerCase().includes(query) || l.name_ne.includes(query)){
      results.push({type:'Local Level', name:l.name_en, nepali:l.name_ne, type_en:l.type_en});
    }
  });

  return results;
}

function displayResults(results) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  results.forEach(r => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${r.type}</strong>: ${r.name} (${r.nepali}) ${r.type_en ? '- '+r.type_en : ''}`;
    container.appendChild(div);
  });
}

document.getElementById('searchBox').addEventListener('input', (e)=>{
  const results = search(e.target.value);
  displayResults(results);
});

window.onload = loadData;