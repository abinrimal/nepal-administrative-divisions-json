let data = [];

const provinceDropdown = document.getElementById('provinceDropdown');
const districtDropdown = document.getElementById('districtDropdown');
const localDropdown = document.getElementById('localDropdown');
const searchBox = document.getElementById('searchBox');
const suggestionsDiv = document.getElementById('suggestions');
const resultsDiv = document.getElementById('results');

// Load JSON
async function loadData() {
  try {
    data = await fetch('../nepal_administrative_divisions.json')
      .then(res => res.json())
      .then(json => json.provinces);

    populateProvinces();
    filterResults();
  } catch (err) {
    console.error('Error loading JSON:', err);
  }
}

// Populate province dropdown
function populateProvinces() {
  data.forEach(p => {
    const option = document.createElement('option');
    option.value = p.name_en;
    option.textContent = p.name_en;
    provinceDropdown.appendChild(option);
  });
}

// Update district dropdown
provinceDropdown.addEventListener('change', () => {
  const selectedProvince = provinceDropdown.value;
  districtDropdown.innerHTML = '<option value="">Select District</option>';
  localDropdown.innerHTML = '<option value="">Select Local Level</option>';
  localDropdown.disabled = true;

  if (!selectedProvince) {
    districtDropdown.disabled = true;
    filterResults();
    return;
  }

  const province = data.find(p => p.name_en === selectedProvince);
  populateDistricts(province);
  filterResults();
});

// Update local dropdown
districtDropdown.addEventListener('change', () => {
  const selectedProvince = provinceDropdown.value;
  const selectedDistrict = districtDropdown.value;
  localDropdown.innerHTML = '<option value="">Select Local Level</option>';

  if (!selectedDistrict) {
    localDropdown.disabled = true;
    filterResults();
    return;
  }

  const province = data.find(p => p.name_en === selectedProvince);
  const district = province.districts.find(d => d.name_en === selectedDistrict);
  populateLocals(district);
  filterResults();
});

localDropdown.addEventListener('change', filterResults);

// Populate dropdown helpers
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

// ---------------- TYPEAHEAD AUTOCOMPLETE ----------------
searchBox.addEventListener('input', () => {
  const query = searchBox.value.toLowerCase();
  suggestionsDiv.innerHTML = '';

  if (!query) {
    filterResults();
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

  // show top 10 suggestions
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

  filterResults();
});

// Apply selection from suggestions
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
  filterResults();
}

// ---------------- FILTER RESULTS ----------------
function filterResults() {
  const query = searchBox.value.toLowerCase();
  const selectedProvince = provinceDropdown.value;
  const selectedDistrict = districtDropdown.value;
  const selectedLocal = localDropdown.value;

  const results = [];

  data.forEach(p => {
    if (selectedProvince && p.name_en !== selectedProvince) return;
    if (p.name_en.toLowerCase().includes(query)) results.push({type:'Province', name:p.name_en, nepali:p.name_ne});

    p.districts.forEach(d => {
      if (selectedDistrict && d.name_en !== selectedDistrict) return;
      if (d.name_en.toLowerCase().includes(query)) results.push({type:'District', name:d.name_en, nepali:d.name_ne});

      d.local_levels.forEach(l => {
        if (selectedLocal && l.name_en !== selectedLocal) return;
        if (l.name_en.toLowerCase().includes(query)) results.push({type:'Local Level', name:l.name_en, nepali:l.name_ne, type_en:l.type_en});
      });
    });
  });

  displayResults(results);
}

// Display results
function displayResults(results) {
  resultsDiv.innerHTML = '';
  if(results.length === 0){
    resultsDiv.innerHTML = '<em>No results found</em>';
    return;
  }
  results.forEach(r => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${r.type}</strong>: ${r.name} (${r.nepali || '-'}) ${r.type_en ? '- '+r.type_en : ''}`;
    resultsDiv.appendChild(div);
  });
}

window.onload = loadData;