import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Main from './Main';

// 區域與地區對應
const REGION_DISTRICTS = {
  hong_kong_island: [
    'Central & Western',
    'Wan Chai',
    'Eastern',
    'Southern',
  ],
  kowloon: [
    'Yau Tsim Mong',
    'Sham Shui Po',
    'Kowloon City',
    'Wong Tai Sin',
    'Kwun Tong',
  ],
  new_territories: [
    'Kwai Tsing',
    'Tsuen Wan',
    'Yuen Long',
    'Tuen Mun',
    'North',
    'Tai Po',
    'Sha Tin',
    'Sai Kung',
    'Islands',
  ],
};

const DISTRICT_LABELS = {
  'Central & Western': { en: 'Central & Western', tc: '中西區', sc: '中西区' },
  'Wan Chai': { en: 'Wan Chai', tc: '灣仔區', sc: '湾仔区' },
  'Eastern': { en: 'Eastern', tc: '東區', sc: '东区' },
  'Southern': { en: 'Southern', tc: '南區', sc: '南区' },
  'Yau Tsim Mong': { en: 'Yau Tsim Mong', tc: '油尖旺區', sc: '油尖旺区' },
  'Sham Shui Po': { en: 'Sham Shui Po', tc: '深水埗區', sc: '深水埗区' },
  'Kowloon City': { en: 'Kowloon City', tc: '九龍城區', sc: '九龙城区' },
  'Wong Tai Sin': { en: 'Wong Tai Sin', tc: '黃大仙區', sc: '黄大仙区' },
  'Kwun Tong': { en: 'Kwun Tong', tc: '觀塘區', sc: '观塘区' },
  'Kwai Tsing': { en: 'Kwai Tsing', tc: '葵青區', sc: '葵青区' },
  'Tsuen Wan': { en: 'Tsuen Wan', tc: '荃灣區', sc: '荃湾区' },
  'Yuen Long': { en: 'Yuen Long', tc: '元朗區', sc: '元朗区' },
  'Tuen Mun': { en: 'Tuen Mun', tc: '屯門區', sc: '屯门区' },
  'North': { en: 'North', tc: '北區', sc: '北区' },
  'Tai Po': { en: 'Tai Po', tc: '大埔區', sc: '大埔区' },
  'Sha Tin': { en: 'Sha Tin', tc: '沙田區', sc: '沙田区' },
  'Sai Kung': { en: 'Sai Kung', tc: '西貢區', sc: '西贡区' },
  'Islands': { en: 'Islands', tc: '離島區', sc: '离岛区' },
};

const REGION_LABELS = {
  hong_kong_island: { en: 'Hong Kong Island', tc: '港島', sc: '港岛' },
  kowloon: { en: 'Kowloon', tc: '九龍', sc: '九龙' },
  new_territories: { en: 'New Territories', tc: '新界', sc: '新界' },
};

// 將字串轉為每個單字首字大寫，其餘小寫
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeRegionName(name) {
  // 支援 "hong kong island" => "hong_kong_island"
  return name
    .toLowerCase()
    .replace(/%20| /g, '_')
    .replace(/[^a-z_]/g, '')
    .trim();
}

const DISTRICT_URL_MAP = {
  'Central-Western': 'Central & Western',
  'Wan-Chai': 'Wan Chai',
  'Eastern': 'Eastern',
  'Southern': 'Southern',
  'Yau-Tsim-Mong': 'Yau Tsim Mong',
  'Sham-Shui-Po': 'Sham Shui Po',
  'Kowloon-City': 'Kowloon City',
  'Wong-Tai-Sin': 'Wong Tai Sin',
  'Kwun-Tong': 'Kwun Tong',
  'Kwai-Tsing': 'Kwai Tsing',
  'Tsuen-Wan': 'Tsuen Wan',
  'Yuen-Long': 'Yuen Long',
  'Tuen-Mun': 'Tuen Mun',
  'North': 'North',
  'Tai-Po': 'Tai Po',
  'Sha-Tin': 'Sha Tin',
  'Sai-Kung': 'Sai Kung',
  'Islands': 'Islands',
};

// 修改 normalizeDistrictName，優先用對照表
function normalizeDistrictName(name) {
  const decoded = decodeURIComponent(name).replace(/\s+/g, '-');
  if (DISTRICT_URL_MAP[decoded]) {
    return DISTRICT_URL_MAP[decoded];
  }
  // fallback: 原本的處理
  return toTitleCase(
    name
      .replace(/-/g, ' ')
      .replace(/%20/g, ' ')
      .replace(/%26|&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function District() {
  // 支援 /district/:region 及 /district/:districtName
  const params = useParams();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [districts, setDistricts] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'en');
  }, []);

  useEffect(() => {
    // region 支援底線與空格
    if (params.region) {
      let regionKey = params.region;
      // 支援 "hong kong island" 或 "hong_kong_island"
      if (!REGION_DISTRICTS[regionKey]) {
        regionKey = normalizeRegionName(regionKey);
      }
      if (REGION_DISTRICTS[regionKey]) {
        setDistricts(REGION_DISTRICTS[regionKey]);
        setTitle(
          `${REGION_LABELS[regionKey]?.[lang] || regionKey.replace(/_/g, ' ')} Parking Information`
        );
        return;
      }
    }
    // district
    if (params.district) {
      const decoded = normalizeDistrictName(decodeURIComponent(params.district));
      setDistricts([decoded]);
      setTitle(
        `${DISTRICT_LABELS[decoded]?.[lang] || decoded} Parking Information`
      );
      return;
    }
    // 舊寫法: /district/:key
    if (params.key) {
      let regionKey = params.key;
      if (!REGION_DISTRICTS[regionKey]) {
        regionKey = normalizeRegionName(regionKey);
      }
      if (REGION_DISTRICTS[regionKey]) {
        setDistricts(REGION_DISTRICTS[regionKey]);
        setTitle(
          `${REGION_LABELS[regionKey]?.[lang] || regionKey.replace(/_/g, ' ')} Parking Information`
        );
      } else {
        const decoded = normalizeDistrictName(decodeURIComponent(params.key));
        setDistricts([decoded]);
        setTitle(
          `${DISTRICT_LABELS[decoded]?.[lang] || decoded} Parking Information`
        );
      }
    }
  }, [params, lang]);

  function DistrictMain(props) {
    return (
      <Main
        {...props}
        lang={lang}
        filterDistricts={districts}
        customTitle={title}
      />
    );
  }

  return <DistrictMain />;
}

export default District;