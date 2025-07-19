// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  try {
    // 构建 Meting API URL，添加随机参数防止缓存
    const apiUrl = `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}&r=${Math.random()}`;

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // 检查返回数据是否有效
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('无效的音乐数据');
    }

    // 处理QQ音乐的特殊URL格式
    if (data[0].url && data[0].url.startsWith("@")) {
      // eslint-disable-next-line no-unused-vars
      const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
      const jsonpData = await fetchJsonp(url).then((res) => res.json());
      const domain = (
        jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
        jsonpData.req_0.data.sip[0]
      ).replace("http://", "https://");

      return data.map((v, i) => ({
        name: v.name || v.title || '未知歌曲',
        artist: v.artist || v.author || '未知艺术家',
        url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
        cover: v.cover || v.pic || '/images/icon/music.png',
        lrc: v.lrc || '',
      }));
    } else {
      // 标准格式处理
      return data.map((v) => ({
        name: v.name || v.title || '未知歌曲',
        artist: v.artist || v.author || '未知艺术家',
        url: v.url || '',
        cover: v.cover || v.pic || '/images/icon/music.png',
        lrc: v.lrc || '',
      })).filter(item => item.url); // 过滤掉没有URL的歌曲
    }
  } catch (error) {
    console.error('获取音乐列表失败:', error);
    // 返回空数组或默认数据
    return [];
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取用户IPv4地址（专门用于高德API）
export const getUserIPv4 = async () => {
  try {
    // 专门用于获取IPv4地址的服务
    const ipv4Services = [
      'https://ipv4.icanhazip.com',
      'https://api.ipify.org',
      'https://ipv4.jsonip.com',
      'https://httpbin.org/ip'
    ];

    for (const service of ipv4Services) {
      try {
        console.log(`尝试获取IPv4地址: ${service}`);

        // 创建一个 Promise 来处理超时
        const fetchWithTimeout = (url, timeout = 3000) => {
          return Promise.race([
            fetch(url),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('请求超时')), timeout)
            )
          ]);
        };

        const response = await fetchWithTimeout(service);
        if (response.ok) {
          const data = await response.text();
          let ip = data.trim();

          // 处理不同API的返回格式
          if (service.includes('jsonip.com')) {
            const jsonData = JSON.parse(data);
            ip = jsonData.ip;
          } else if (service.includes('httpbin.org')) {
            const jsonData = JSON.parse(data);
            ip = jsonData.origin.split(',')[0].trim(); // 处理可能的代理IP
          }

          // 验证是否为有效的IPv4地址
          const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          if (ipv4Regex.test(ip)) {
            console.log('获取到IPv4地址:', ip);
            return ip;
          }
        }
      } catch (error) {
        console.warn(`IPv4服务 ${service} 获取失败:`, error);
        continue;
      }
    }

    console.warn('所有IPv4服务都失败');
    return null;
  } catch (error) {
    console.error('获取IPv4地址失败:', error);
    return null;
  }
};

// 获取用户地理位置信息（优先使用免费IP检测）
export const getUserLocation = async () => {
  try {
    const services = [
      {
        url: 'http://ip-api.com/json/?lang=zh-CN&fields=status,country,countryCode,regionName,city,query',
        parser: (data) => {
          if (data.status !== 'success') {
            throw new Error(data.message || '查询失败');
          }
          return {
            country: data.country,
            countryCode: data.countryCode,
            region: data.regionName,
            city: data.city,
            ip: data.query
          };
        }
      },
      {
        url: 'https://ipapi.co/json/',
        parser: (data) => {
          if (data.error) {
            throw new Error(data.reason || '服务错误');
          }
          return {
            country: data.country_name,
            countryCode: data.country_code,
            region: data.region,
            city: data.city,
            ip: data.ip
          };
        }
      },
      {
        url: 'https://freeipapi.com/api/json',
        parser: (data) => ({
          country: data.countryName,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.cityName,
          ip: data.ipAddress
        })
      }
    ];

    for (const service of services) {
      try {
        console.log(`尝试获取地理位置信息: ${service.url}`);

        // 创建一个 Promise 来处理超时
        const fetchWithTimeout = (url, timeout = 5000) => {
          return Promise.race([
            fetch(url, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; LocationService/1.0)'
              }
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('请求超时')), timeout)
            )
          ]);
        };

        const response = await fetchWithTimeout(service.url);

        if (response.ok) {
          const data = await response.json();
          console.log(`${service.url} 返回数据:`, data);

          const result = service.parser(data);

          // 验证结果有效性
          if (!result.country || !result.countryCode) {
            console.warn(`${service.url} 返回的数据不完整:`, result);
            continue;
          }

          // 特殊处理中国台湾、香港、澳门
          if (result.countryCode === 'TW') {
            result.country = '中国台湾';
            result.isChina = false;
          } else if (result.countryCode === 'HK') {
            result.country = '中国香港';
            result.isChina = false;
          } else if (result.countryCode === 'MO') {
            result.country = '中国澳门';
            result.isChina = false;
          } else if (result.countryCode === 'CN') {
            result.isChina = true;
          } else {
            result.isChina = false;
          }

          console.log('获取到地理位置信息:', result);
          return result;
        } else {
          console.warn(`${service.url} HTTP错误:`, response.status, response.statusText);
        }
      } catch (error) {
        console.warn(`地理位置服务 ${service.url} 失败:`, error.message);
        continue;
      }
    }

    console.warn('所有地理位置服务都失败，返回默认值');
    return {
      country: '未知地区',
      countryCode: 'XX',
      isChina: false,
      city: null,
      region: null,
      ip: null
    };
  } catch (error) {
    console.error('获取地理位置失败:', error);
    return {
      country: '未知地区',
      countryCode: 'XX',
      isChina: false,
      city: null,
      region: null,
      ip: null
    };
  }
};

// 获取高德地理位置信息（仅用于中国大陆用户）
export const getAdcode = async (key) => {
  try {
    // 获取IPv4地址用于高德API查询
    const ipv4 = await getUserIPv4();
    let url = `https://restapi.amap.com/v3/ip?key=${key}`;

    if (ipv4) {
      url += `&ip=${ipv4}`;
      console.log('使用IPv4地址查询高德:', ipv4);
    } else {
      console.warn('未能获取到IPv4地址，使用高德默认IP检测');
    }

    const res = await fetch(url);
    const data = await res.json();

    console.log('高德IP定位返回:', data);

    if (data.infocode !== "10000") {
      throw new Error("高德地区查询失败: " + (data.info || "未知错误"));
    }

    return data;
  } catch (error) {
    console.error('获取高德地理位置失败:', error);
    throw error;
  }
};// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};
