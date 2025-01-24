<template>
  <view class="ios-container">
    <!-- iOS 风格导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">待办事项</text>
      <view class="nav-right">
        <text class="nav-btn" @click="showFilter">
          {{ currentFilter.label }}
          <text class="arrow-down">▼</text>
        </text>
      </view>
    </view>

    <!-- 任务列表区域 -->
    <view class="todo-list" :class="{ empty: !filteredTasks.length }">
      <todoItemList 
        v-if="filteredTasks.length"
        :tasks="filteredTasks" 
        @edit="goToTodoItem" 
        @delete="deleteTask" 
        @toggle="toggleTask"
        @refresh="getTasksFromStorage"
      />
      <view v-else class="empty-state">
        <image src="/static/empty-tasks.png" mode="aspectFit" class="empty-image"/>
        <text class="empty-text">暂无待办事项</text>
      </view>
    </view>

    <!-- iOS 风格添加按钮 -->
    <view class="add-btn" @click="goToAddTodo">
      <text class="add-icon">+</text>
    </view>

    <!-- 筛选弹出框 -->
    <uni-popup ref="filterPopup" type="bottom">
      <view class="filter-popup">
        <view class="filter-header">
          <text>筛选任务</text>
          <text class="close-btn" @click="hideFilter">完成</text>
        </view>
        <view class="filter-options">
          <view 
            v-for="filter in filterOptions" 
            :key="filter.value"
            class="filter-item"
            :class="{ active: currentFilter.value === filter.value }"
            @click="selectFilter(filter)"
          >
            <text>{{ filter.label }}</text>
            <text v-if="currentFilter.value === filter.value" class="check-mark">✓</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import todoItemList from '@/components/todoItemList.vue'
import { getTasks } from '@/utils/storage.js'

export default {
  components: {
    todoItemList
  },
  data() {
    return {
      tasks: [],
      filterOptions: [
        { label: '全部', value: 'all' },
        { label: '未完成', value: 'active' },
        { label: '已完成', value: 'completed' }
      ],
      currentFilter: { label: '全部', value: 'all' }
    }
  },
  computed: {
    filteredTasks() {
      switch (this.currentFilter.value) {
        case 'active':
          return this.tasks.filter(task => !task.completed)
        case 'completed':
          return this.tasks.filter(task => task.completed)
        default:
          return this.tasks
      }
    }
  },
  methods: {
    goToAddTodo() {
      uni.navigateTo({
        url: '/pages/addTodo/addTodo'
      })
    },
    goToTodoItem(taskId) {
      uni.navigateTo({
        url: `/pages/todoItem/todoItem?id=${taskId}`
      })
    },
    getTasksFromStorage() {
      try {
        this.tasks = getTasks()
      } catch (error) {
        uni.showToast({
          title: '加载任务失败',
          icon: 'none'
        })
      }
    },
    confirmDelete(taskId) {
      uni.showModal({
        title: '确认删除',
        content: '是否确定删除该任务？',
        success: (res) => {
          if (res.confirm) {
            this.deleteTask(taskId)
          }
        }
      })
    },
    deleteTask(taskId) {
      const index = this.tasks.findIndex(task => task.id === taskId)
      if (index !== -1) {
        this.tasks.splice(index, 1)
        this.saveTasksToStorage()
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    },
    toggleTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        task.completedAt = task.completed ? new Date().toISOString() : null
        this.saveTasksToStorage()
      }
    },
    saveTasksToStorage() {
      try {
        uni.setStorageSync('tasks', JSON.stringify(this.tasks))
      } catch (error) {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    showFilter() {
      this.$refs.filterPopup.open()
    },
    hideFilter() {
      this.$refs.filterPopup.close()
    },
    selectFilter(filter) {
      this.currentFilter = filter
      this.hideFilter()
    }
  },
  onShow() {
    // 每次显示页面时重新加载任务列表
    this.getTasksFromStorage()
  }
}
</script>

<style scoped>
.ios-container {
  background-color: #F2F2F7;
  min-height: 100vh;
}

.nav-bar {
  padding: 44px 16px 10px;
  background-color: #FFFFFF;
  border-bottom: 0.5px solid #E5E5EA;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
}

.nav-btn {
  color: #007AFF;
  font-size: 17px;
}

.arrow-down {
  font-size: 12px;
  margin-left: 4px;
}

.todo-list {
  padding: 20px;
}
.todo-list.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.empty-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20px;
}

.empty-text {
  color: #8E8E93;
  font-size: 17px;
}
/* 悬浮按钮样式 */
.add-btn {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 44px;
  height: 44px;
  background-color: #007AFF;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
  z-index: 9999;
  /* 适配底部安全区域 */
  margin-bottom: constant(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);
}

.add-icon {
  color: #FFFFFF;
  font-size: 28px;
  font-weight: 300;
  line-height: 44px;
  text-align: center;
}

/* 点击效果 */
.add-btn:active {
  opacity: 0.8;
  transform: scale(0.96);
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  .add-btn {
    background-color: #0A84FF;
  }
}

.filter-popup {
  background-color: #FFFFFF;
  border-radius: 12px 12px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.filter-header {
  padding: 16px;
  border-bottom: 0.5px solid #E5E5EA;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  color: #007AFF;
}

.filter-options {
  padding: 8px 0;
}

.filter-item {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-item.active {
  color: #007AFF;
}

.check-mark {
  color: #007AFF;
  font-weight: bold;
}

/* 确保在滚动时保持固定 */
.safe-area-bottom {
  bottom: calc(20px + constant(safe-area-inset-bottom));
  bottom: calc(20px + env(safe-area-inset-bottom));
}
</style>