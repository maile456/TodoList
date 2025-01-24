<template>
  <view class="ios-container">
    <!-- iOS 风格的导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="nav-btn cancel" @click="goBack">取消</text>
      <text class="nav-title">新建任务</text>
      <text class="nav-btn confirm" :class="{ disabled: !isValidTask }" @click="addTask">完成</text>
    </view>
    
    <!-- iOS 风格的表单 -->
    <view class="form-section">
      <!-- 任务名称输入 -->
      <view class="form-group">
        <input 
          class="ios-input"
          v-model="taskName"
          placeholder="任务名称"
          placeholder-class="placeholder"
          @input="validateInput"
          maxlength="50"
        />
        <text class="char-count">{{ taskName.length }}/50</text>
      </view>
      
      <!-- 优先级选择 -->
      <view class="form-group priority-section">
        <text class="group-label">优先级</text>
        <view class="priority-options">
          <view 
            v-for="(item, index) in priorities" 
            :key="index"
            class="priority-item"
            :class="{ active: selectedPriority === index }"
            @click="selectedPriority = index"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <!-- 截止日期选择 -->
      <view class="form-group date-section">
        <text class="group-label">截止日期</text>
        <picker 
          mode="date" 
          :value="dueDate" 
          :start="today"
          end="2030-12-31" 
          @change="onDateChange"
        >
          <view class="date-picker">
            <text :class="{ placeholder: !dueDate }">{{ dueDate ? formatDate(dueDate) : '请选择日期' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>
    </view>
  </view>
</template>

<script>
import { saveTask } from '@/utils/storage.js'

export default {
  data() {
    return {
      taskName: '',
      selectedPriority: 1,
      priorities: ['低', '中', '高'],
      isValidTask: false,
      dueDate: '',
      today: new Date().toISOString().split('T')[0],
      statusBarHeight: 0
    }
  },

  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },

  methods: {
    validateInput() {
      this.isValidTask = this.taskName.trim().length > 0
    },
    
    onDateChange(e) {
      this.dueDate = e.detail.value
    },

    formatDate(date) {
      if (!date) return ''
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      
      if (date === today) return '今天'
      if (date === tomorrow) return '明天'
      return date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2月$3日')
    },

    goBack() {
      if (this.taskName.trim()) {
        uni.showModal({
          title: '提示',
          content: '是否放弃创建任务？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        })
      } else {
        uni.navigateBack()
      }
    },
    
    addTask() {
      if (!this.isValidTask) return
      
      const task = {
        id: Date.now(),
        name: this.taskName.trim(),
        completed: false,
        priority: this.selectedPriority,
        dueDate: this.dueDate,
        createTime: new Date().toISOString()
      }
      
      saveTask(task)
      uni.showToast({
        title: '已添加任务',
        icon: 'success'
      })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  }
}
</script>

<style scoped>
.ios-container {
  background-color: #F2F2F7;
  min-height: 100vh;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 10px;
  background-color: #FFFFFF;
  border-bottom: 0.5px solid #E5E5EA;
  height: 44px;
}

.nav-btn {
  font-size: 17px;
  padding: 8px;
}

.cancel {
  color: #8E8E93;
}

.confirm {
  color: #007AFF;
}

.confirm.disabled {
  opacity: 0.5;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
}

.form-section {
  margin-top: 20px;
  padding: 0 16px;
}

.form-group {
  background-color: #FFFFFF;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 10px;
}

.ios-input {
  height: 44px;
  font-size: 17px;
  width: 100%;
}

.placeholder {
  color: #8E8E93;
}

.char-count {
  font-size: 13px;
  color: #8E8E93;
  text-align: right;
  margin-top: 4px;
}

.group-label {
  font-size: 15px;
  color: #3C3C43;
  margin-bottom: 12px;
}

.priority-section,
.date-section {
  padding-top: 12px;
  padding-bottom: 12px;
}

.priority-options {
  display: flex;
  gap: 8px;
}

.priority-item {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background-color: #F2F2F7;
  color: #8E8E93;
}

.priority-item.active {
  background-color: #007AFF;
  color: #FFFFFF;
}

.date-picker {
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 17px;
  color: #007AFF;
}

.arrow {
  color: #C7C7CC;
  font-size: 20px;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .ios-container {
    background-color: #000000;
  }

  .nav-bar,
  .form-group {
    background-color: #1C1C1E;
    border-bottom-color: #38383A;
  }

  .nav-title,
  .group-label {
    color: #FFFFFF;
  }

  .priority-item {
    background-color: #2C2C2E;
  }

  .priority-item.active {
    background-color: #0A84FF;
  }

  .date-picker {
    color: #0A84FF;
  }

  .arrow {
    color: #48484A;
  }
}
</style>