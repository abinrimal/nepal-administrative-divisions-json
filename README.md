![MIT License](https://img.shields.io/badge/license-MIT-green)
![JSON Dataset](https://img.shields.io/badge/format-JSON-blue)
![Nepal Administrative Data](https://img.shields.io/badge/data-Nepal-red)

# Nepal Administrative Divisions JSON 🇳🇵

A clean, developer-friendly JSON dataset of Nepal's full administrative structure based on the Constitution of Nepal and the Local Government Operation Act.

This repository provides properly structured and formatted data for:

- 7 Provinces
- 77 Districts
- 753 Local Levels
  - 6 Metropolitan Cities
  - 11 Sub-Metropolitan Cities
  - 276 Municipalities
  - 460 Rural Municipalities

All names are available in **English** and **Nepali (Devanagari)**.

---

## 📂 Files Included

| File | Description |
|-----|-------------|
| `provinces.json` | All 7 provinces |
| `districts.json` | All 77 districts mapped to provinces |
| `local_levels.json` | All 753 local levels mapped to districts & provinces |
| `local_level_types.json` | Types of local levels |

---

## 🧱 Data Structure

### Province

```json
{
  "code": "1",
  "name_en": "Koshi Province",
  "name_ne": "कोशी प्रदेश"
}
```

### District

```json
{
  "code": "01",
  "name_en": "Bhojpur",
  "name_ne": "भोजपुर",
  "province_code": "1"
}
```
### Local Level
```json
{
  "code": "0101",
  "name_en": "Bhojpur Municipality",
  "name_ne": "भोजपुर नगरपालिका",
  "district_code": "01",
  "province_code": "1",
  "type_en": "Municipality",
  "type_ne": "नगरपालिका"
}
```
## Use Cases

This dataset is useful for:

- Web & mobile app dropdowns
- GIS & mapping
- Government / NGO systems
- Academic projects
- Data analysis
- Database seeding
- APIs

## Contribution

If administrative changes happen or corrections are needed, feel free to open a PR.
