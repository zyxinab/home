<template>
  <div class="player-wrapper">
    <div v-if="!store.musicIsOk && loading" class="loading-info">
      正在加载音乐播放器...
    </div>
    <div v-else-if="!store.musicIsOk && !loading" class="error-info">
      音乐播放器加载失败
    </div>
    <APlayer
      v-if="playList.length > 0 && store.musicIsOk"
      ref="player"
      :audio="playList"
      :autoplay="true"
      :theme="theme"
      :autoSwitch="false"
      :loop="store.playerLoop"
      :order="store.playerOrder"
      :volume="volume"
      :showLrc="true"
      :listFolded="listFolded"
      :listMaxHeight="listMaxHeight"
      :noticeSwitch="false"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUp"
      @error="loadMusicError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, h } from 'vue';
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import APlayer from "@worstone/vue-aplayer";
import { ElMessage } from "element-plus";

const store = mainStore();

// 获取播放器 DOM
const player = ref(null);

// 歌曲播放列表
const playList = ref([]);

// 歌曲播放项
const playIndex = ref(0);

// 加载状态
const loading = ref(false);

// 配置项
const props = defineProps({
  // 主题色
  theme: {
    type: String,
    default: "#efefef",
  },
  // 默认音量
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
  songServer: {
    type: String,
    default: import.meta.env.VITE_SONG_SERVER || "netease",
  },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
  songType: {
    type: String,
    default: import.meta.env.VITE_SONG_TYPE || "playlist",
  },
  // id
  songId: {
    type: String,
    default: import.meta.env.VITE_SONG_ID || "697317512",
  },
  // 列表是否默认折叠
  listFolded: {
    type: Boolean,
    default: false,
  },
  // 列表最大高度
  listMaxHeight: {
    type: Number,
    default: 420,
  },
});

const listHeight = computed(() => {
  return props.listMaxHeight + "px";
});

// 初始化播放器
onMounted(() => {
  // 检查是否配置了音乐ID
  if (!props.songId || props.songId.trim() === '') {
    console.log('未配置音乐ID，跳过播放器初始化');
    return;
  }
  
  nextTick(async () => {
    loading.value = true;
    try {
      console.log('开始加载音乐列表...');
      console.log('API地址:', import.meta.env.VITE_SONG_API);
      console.log('配置:', { 
        server: props.songServer, 
        type: props.songType, 
        id: props.songId 
      });
      
      const res = await getPlayerList(props.songServer, props.songType, props.songId);
      
      console.log('API返回结果:', res);
      
      if (!res || !Array.isArray(res) || res.length === 0) {
        throw new Error('获取到空的音乐列表或格式错误');
      }
      
      // 验证每首歌曲是否有必要的字段
      const validSongs = res.filter(song => song.url && song.name);
      
      if (validSongs.length === 0) {
        throw new Error('没有有效的音乐文件');
      }
      
      console.log('有效音乐数量:', validSongs.length);
      
      // 更改播放器加载状态
      store.musicIsOk = true;
      // 生成歌单
      playList.value = validSongs;
      
      console.log("音乐加载完成");
      console.log('播放列表:', playList.value);
      
      ElMessage({
        message: `已加载 ${playList.value.length} 首歌曲`,
        grouping: true,
        icon: h(MusicOne, {
          theme: "filled",
          fill: "#efefef",
        }),
      });
      
    } catch (err) {
      console.error('音乐播放器加载失败:', err);
      console.error('错误详情:', {
        message: err.message,
        stack: err.stack,
        api: import.meta.env.VITE_SONG_API,
        config: { 
          server: props.songServer, 
          type: props.songType, 
          id: props.songId 
        }
      });
      
      store.musicIsOk = false;
      ElMessage({
        message: "播放器加载失败: " + (err.message || '未知错误'),
        grouping: true,
        type: 'error',
        duration: 5000,
        icon: h(PlayWrong, {
          theme: "filled",
          fill: "#f56c6c",
        }),
      });
    } finally {
      loading.value = false;
    }
  });
});

// 播放
const onPlay = () => {
  console.log("播放");
  playIndex.value = player.value.aplayer.index;
  // 播放状态
  store.setPlayerState(player.value.audioRef.paused);
  // 储存播放器信息
  store.setPlayerData(playList.value[playIndex.value].name, playList.value[playIndex.value].artist);
  ElMessage({
    message: store.getPlayerData.name + " - " + store.getPlayerData.artist,
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

// 暂停
const onPause = () => {
  store.setPlayerState(player.value.audioRef.paused);
};

// 音频时间更新事件
const onTimeUp = () => {
  let lyrics = player.value.aplayer.lyrics[playIndex.value];
  let lyricIndex = player.value.aplayer.lyricIndex;
  if (!lyrics || !lyrics[lyricIndex]) {
    return;
  }
  let lrc = lyrics[lyricIndex][1];
  if (lrc === "Loading") {
    lrc = "歌词加载中";
  } else if (lrc === "Not available") {
    lrc = "歌词加载失败";
  }
  store.setPlayerLrc(lrc);
};

// 切换播放暂停事件
const playToggle = () => {
  player.value.toggle();
};

// 切换音量事件
const changeVolume = (value) => {
  player.value.setVolume(value, false);
};

// 切换上下曲
const changeSong = (type) => {
  type === 0 ? player.value.skipBack() : player.value.skipForward();
  nextTick(() => {
    player.value.play();
  });
};

// 切换歌曲列表状态
const toggleList = () => {
  player.value.toggleList();
};

// 加载音频错误
const loadMusicError = () => {
  let notice = "";
  if (playList.value.length > 1) {
    notice = "播放歌曲出现错误，播放器将在 2s 后进行下一首";
  } else {
    notice = "播放歌曲出现错误";
  }
  ElMessage({
    message: notice,
    grouping: true,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#EFEFEF",
      duration: 2000,
    }),
  });
  console.error(
    "播放歌曲: " + player.value.aplayer.audio[player.value.aplayer.index].name + " 出现错误",
  );
};

// 暴露子组件方法
defineExpose({ playToggle, changeVolume, changeSong, toggleList });
</script>

<style lang="scss" scoped>
.player-wrapper {
  width: 80%;
  
  .loading-info, .error-info {
    padding: 20px;
    text-align: center;
    border-radius: 6px;
    background-color: #ffffff40;
    backdrop-filter: blur(10px);
    color: #efefef;
    font-family: "HarmonyOS_Regular", sans-serif;
  }
  
  .error-info {
    background-color: #ff666640;
  }
}

.aplayer {
  width: 80%;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  :deep(.aplayer-body) {
    background-color: transparent;
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent !important;
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
      .aplayer-lrc {
        text-align: left;
        margin: 7px 0 6px 6px;
        height: 44px;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: none;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    height: v-bind(listHeight);
    background-color: transparent;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>
