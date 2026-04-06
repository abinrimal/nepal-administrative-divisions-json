let data = [];

const provinceDropdown = document.getElementById('provinceDropdown');
const districtDropdown = document.getElementById('districtDropdown');
const localDropdown = document.getElementById('localDropdown');
const searchBox = document.getElementById('searchBox');
const suggestionsDiv = document.getElementById('suggestions');
const resultsDiv = document.getElementById('results');
const copyBtn = document.getElementById('copyBtn');

// Load JSON
async function loadData() {
  try {
    data = await fetch('../nepal_administrative_divisions.json')
      .then(res => res.json())
      .then(json => json.provinces);

    populateProvinces();
    displayJSONTree(data, true); // Fully expanded initially
  } catch (err) {
    console.error('Error loading JSON:', err);
  }
}

// ---------------- Dropdowns ----------------
function populateProvinces() {
  data.forEach(p => {
    const option = document.createElement('option');
    option.value = p.name_en;
    option.textContent = p.name_en;
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
    filterAndDisplayJSON();
    return;
  }

  const province = data.find(p => p.name_en === selectedProvince);
  populateDistricts(province);
  filterAndDisplayJSON();
});

districtDropdown.addEventListener('change', () => {
  const selectedProvince = provinceDropdown.value;
  const selectedDistrict = districtDropdown.value;
  localDropdown.innerHTML = '<option value="">Select Local Level</option>';

  if (!selectedDistrict) {
    localDropdown.disabled = true;
    filterAndDisplayJSON();
    return;
  }

  const province = data.find(p => p.name_en === selectedProvince);
  const district = province.districts.find(d => d.name_en === selectedDistrict);
  populateLocals(district);
  filterAndDisplayJSON();
});

localDropdown.addEventListener('change', filterAndDisplayJSON);

function populateDistricts(province) {
  districtDropdown.innerHTML = '<option value="">Select District</option>';
  province.districts.forEach(d => {
    const option = document.createElement('option');
    option.value = d.name_en;
    option.textContent = d.name_en;
    districtDropdown.appendChild(option);
  });
  districtDropdown.disabled = false;
  localDropdown.innerHTML = '<option value="">Select Local Level</option>';
  localDropdown.disabled = true;
}

function populateLocals(district) {
  localDropdown.innerHTML = '<option value="">Select Local Level</option>';
  district.local_levels.forEach(l => {
    const option = document.createElement('option');
    option.value = l.name_en;
    option.textContent = l.name_en;
    localDropdown.appendChild(option);
  });
  localDropdown.disabled = false;
}

// ---------------- TYPEAHEAD ----------------
searchBox.addEventListener('input', () => {
  const query = searchBox.value.toLowerCase();
  suggestionsDiv.innerHTML = '';

  if (!query) {
    filterAndDisplayJSON();
    return;
  }

  const matches = [];

  data.forEach(p => {
    if (p.name_en.toLowerCase().includes(query) || p.name_ne.includes(query)) {
      matches.push({type:'Province', name:p.name_en, nepali:p.name_ne});
    }
    p.districts.forEach(d => {
      if (d.name_en.toLowerCase().includes(query) || d.name_ne.includes(query)) {
        matches.push({type:'District', name:d.name_en, nepali:d.name_ne, province:p.name_en});
      }
      d.local_levels.forEach(l => {
        if (l.name_en.toLowerCase().includes(query) || l.name_ne.includes(query)) {
          matches.push({type:'Local Level', name:l.name_en, nepali:l.name_ne, type_en:l.type_en, province:p.name_en, district:d.name_en});
        }
      });
    });
  });

  matches.slice(0,10).forEach(m => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = `${m.type}: ${m.name} (${m.nepali || '-'})`;
    div.addEventListener('click', () => {
      applySelection(m);
      suggestionsDiv.innerHTML = '';
    });
    suggestionsDiv.appendChild(div);
  });

  filterAndDisplayJSON();
});

function applySelection(match) {
  if (match.type === 'Province') {
    provinceDropdown.value = match.name;
    const province = data.find(p => p.name_en === match.name);
    populateDistricts(province);
    districtDropdown.value = '';
    localDropdown.value = '';
  } else if (match.type === 'District') {
    provinceDropdown.value = match.province;
    const province = data.find(p => p.name_en === match.province);
    populateDistricts(province);
    districtDropdown.value = match.name;
    const district = province.districts.find(d => d.name_en === match.name);
    populateLocals(district);
    localDropdown.value = '';
  } else if (match.type === 'Local Level') {
    provinceDropdown.value = match.province;
    const province = data.find(p => p.name_en === match.province);
    populateDistricts(province);
    districtDropdown.value = match.district;
    const district = province.districts.find(d => d.name_en === match.district);
    populateLocals(district);
    localDropdown.value = match.name;
  }

  searchBox.value = match.name;
  filterAndDisplayJSON();
}

// ---------------- FILTER & DISPLAY COLLAPSIBLE JSON ----------------
function filterAndDisplayJSON() {
  const selectedProvince = provinceDropdown.value;
  const selectedDistrict = districtDropdown.value;
  const selectedLocal = localDropdown.value;

  const filtered = data.map(p => {
    if (selectedProvince && p.name_en !== selectedProvince) return null;
    const districts = p.districts.map(d => {
      if (selectedDistrict && d.name_en !== selectedDistrict) return null;
      const locals = d.local_levels.filter(l => !selectedLocal || l.name_en === selectedLocal);
      return {...d, local_levels: locals};
    }).filter(Boolean);
    return {...p, districts};
  }).filter(Boolean);

  displayJSONTree(filtered, true); // fully expanded initially
}

// ---------------- DISPLAY COLLAPSIBLE JSON WITH ARROWS ----------------
function displayJSONTree(arr, expanded = false) {
  resultsDiv.innerHTML = '';
  
  arr.forEach(p => {
    const pDiv = createCollapsibleItem(`${p.name_en} (${p.name_ne})`, p.districts, expanded);
    resultsDiv.appendChild(pDiv);
  });
}

function createCollapsibleItem(title, children, expanded) {
  const container = document.createElement('div');
  container.className = 'collapsible-container';

  const header = document.createElement('div');
  header.className = 'collapsible-header';
  header.innerHTML = `<span class="arrow">${expanded ? '▼' : '▶'}</span> ${title}`;

  const content = document.createElement('div');
  content.className = 'collapsible-content';
  if (expanded) content.classList.add('active');

  if (Array.isArray(children)) {
    children.forEach(d => {
      const dDiv = createCollapsibleItem(`${d.name_en} (${d.name_ne})`, d.local_levels, expanded);
      content.appendChild(dDiv);
    });
  }

  header.addEventListener('click', () => {
    content.classList.toggle('active');
    const arrow = header.querySelector('.arrow');
    arrow.textContent = content.classList.contains('active') ? '▼' : '▶';
  });

  container.appendChild(header);
  container.appendChild(content);
  return container;
}

// ---------------- COPY TO CLIPBOARD ----------------
copyBtn.addEventListener('click', () => {
  const selectedProvince = provinceDropdown.value;
  const selectedDistrict = districtDropdown.value;
  const selectedLocal = localDropdown.value;

  const filtered = data.map(p => {
    if (selectedProvince && p.name_en !== selectedProvince) return null;
    const districts = p.districts.map(d => {
      if (selectedDistrict && d.name_en !== selectedDistrict) return null;
      const locals = d.local_levels.filter(l => !selectedLocal || l.name_en === selectedLocal);
      return {...d, local_levels: locals};
    }).filter(Boolean);
    return {...p, districts};
  }).filter(Boolean);

  navigator.clipboard.writeText(JSON.stringify(filtered, null, 2))
    .then(() => alert('JSON copied to clipboard!'))
    .catch(err => alert('Failed to copy JSON: '+err));
});

window.onload = loadData;