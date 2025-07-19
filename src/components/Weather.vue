<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else-if="weatherData.isOverseas">
    <span>欢迎来自{{ weatherData.country || '远方' }}的朋友</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { reactive, onMounted, h } from 'vue';
import { getUserLocation, getUserIPv4, getAdcode, getWeather, getOtherWeather } from "@/api";
import { Error } from "@icon-park/vue-next";
import { ElMessage } from 'element-plus';

// 高德开发者 Key
const mainKey = import.meta.env.VITE_WEATHER_KEY;

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
  isOverseas: false, // 是否为海外用户
  country: null, // 国家/地区名称
});

// 取出天气平均值
const getTemperature = (min, max) => {
  try {
    // 计算平均值并四舍五入
    const average = (Number(min) + Number(max)) / 2;
    return Math.round(average);
  } catch (error) {
    console.error("计算温度出现错误：", error);
    return "NaN";
  }
};

// 获取天气数据
const getWeatherData = async () => {
  try {
    // 如果没有配置高德Key，直接使用备用天气接口
    if (!mainKey) {
      console.log("未配置高德Key，使用备用天气接口");
      try {
        const result = await getOtherWeather();
        console.log("备用天气接口返回:", result);
        const data = result.result;
        weatherData.adCode = {
          city: data.city.City || "未知地区",
        };
        weatherData.weather = {
          weather: data.condition.day_weather,
          temperature: getTemperature(data.condition.min_degree, data.condition.max_degree),
          winddirection: data.condition.day_wind_direction,
          windpower: data.condition.day_wind_power,
        };
        return;
      } catch (backupError) {
        console.error("备用天气接口也失败:", backupError);
        throw new Error("所有天气服务都无法访问");
      }
    }

    // 首先获取用户地理位置信息
    console.log("开始获取用户地理位置信息...");
    const locationInfo = await getUserLocation();
    
    if (!locationInfo) {
      throw new Error("无法获取地理位置信息");
    }

    console.log("用户地理位置信息:", locationInfo);

    // 判断是否为中国大陆用户
    if (locationInfo.isChina) {
      console.log("检测到中国大陆用户，使用高德API获取详细天气信息");
      
      try {
        // 使用高德API获取更详细的城市信息
        const adCode = await getAdcode(mainKey);
        
        weatherData.adCode = {
          city: adCode.city || locationInfo.city || "未知城市",
          adcode: adCode.adcode,
        };
        
        // 获取天气信息
        const weatherResult = await getWeather(mainKey, weatherData.adCode.adcode);
        console.log("高德天气查询结果:", weatherResult);
        
        if (weatherResult.infocode !== "10000" || !weatherResult.lives || weatherResult.lives.length === 0) {
          throw new Error("天气信息查询失败: " + (weatherResult.info || "无有效数据"));
        }
        
        weatherData.weather = {
          weather: weatherResult.lives[0].weather,
          temperature: weatherResult.lives[0].temperature,
          winddirection: weatherResult.lives[0].winddirection,
          windpower: weatherResult.lives[0].windpower,
        };
        
      } catch (amapError) {
        console.error("高德API调用失败:", amapError);
        // 高德API失败时，使用备用天气接口
        try {
          console.log("高德API失败，使用备用天气接口");
          const result = await getOtherWeather();
          const data = result.result;
          weatherData.adCode = {
            city: locationInfo.city || data.city.City || "未知地区",
          };
          weatherData.weather = {
            weather: data.condition.day_weather,
            temperature: getTemperature(data.condition.min_degree, data.condition.max_degree),
            winddirection: data.condition.day_wind_direction,
            windpower: data.condition.day_wind_power,
          };
        } catch (backupError) {
          throw new Error("所有天气服务都失败了");
        }
      }
    } else {
      // 海外用户，显示欢迎信息
      console.log("检测到海外用户:", locationInfo.country);
      weatherData.isOverseas = true;
      weatherData.country = locationInfo.country || "远方";
    }
    
  } catch (error) {
    console.error("天气信息获取失败:", error);
    onError("天气信息获取失败: " + (error.message || error));
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>