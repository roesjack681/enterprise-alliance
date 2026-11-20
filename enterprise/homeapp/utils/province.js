import provinces from './data.min.json';
export function getRegionByIndex(index) {
  //if (!Array.isArray(provinces)) return null;
  //if (index < 0 || index >= provinces.length) return null;
  return provinces[index-1];
}

export function getProvinceList() {
  return provinces.map(p => ({ label: p.name, value: p.code }));
}

export function getCityList(provinceCode) {
  const province = provinces.find(p => p.code === provinceCode);
  return province?.children?.map(c => ({ label: c.name, value: c.code })) || [];
}

export function getAreaList(provinceCode, cityCode) {
  const province = provinces.find(p => p.code === provinceCode);
  const city = province?.children?.find(c => c.code === cityCode);
  return city?.children?.map(a => ({ label: a.name, value: a.code })) || [];
}