let provinces = [];
let districts = [];
let localLevels = [];

async function loadData() {
  provinces = await fetch('../provinces.json').then(res => res.json());
  districts = await fetch('../districts.json').then(res => res.json());
  localLevels = await fetch('../local_levels.json').then(res => res.json());
}

let data = []; // will hold JSON

// Fetch JSON from local server or hosted URL
fetch('../provinces.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    populateProvinces();
  })
  .catch(err => console.error('Error loading JSON:', err));

const provinceDropdown = document.getElementById('provinceDropdown');
const districtDropdown = document.getElementById('districtDropdown');
const localDropdown = document.getElementById('localDropdown');

function populateProvinces() {
  data.forEach(province => {
    const option = document.createElement('option');
    option.value = province.province;
    option.textContent = province.province;
    provinceDropdown.appendChild(option);
  });
}

provinceDropdown.addEventListener('change', () => {
  const selectedProvince = provinceDropdown.value;
  districtDropdown.innerHTML = '<option value="">Select District</option>';
  localDropdown.innerHTML = '<option value="">Select Local Level</option>';
  localDropdown.disabled = true;

  if (!selectedProvince) {
    districtDropdown.disabled = true;
    return;
  }

  const province = data.find(p => p.province === selectedProvince);
  province.districts.forEach(d => {
    const option = document.createElement('option');
    option.value = d.name;
    option.textContent = d.name;
    districtDropdown.appendChild(option);
  });

  districtDropdown.disabled = false;
});

districtDropdown.addEventListener('change', () => {
  const selectedProvince = provinceDropdown.value;
  const selectedDistrict = districtDropdown.value;
  localDropdown.innerHTML = '<option value="">Select Local Level</option>';

  if (!selectedDistrict) {
    localDropdown.disabled = true;
    return;
  }

  const province = data.find(p => p.province === selectedProvince);
  const district = province.districts.find(d => d.name === selectedDistrict);
  district.locals.forEach(local => {
    const option = document.createElement('option');
    option.value = local;
    option.textContent = local;
    localDropdown.appendChild(option);
  });

  localDropdown.disabled = false;
});

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