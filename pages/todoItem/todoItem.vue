<template>
  <view class="ios-container">
    <!-- iOS 风格导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="nav-btn cancel" @click="handleBack">取消</text>
      <text class="nav-title">编辑任务</text>
      <text 
        class="nav-btn confirm" 
        :class="{ disabled: !isValidTask }" 
        @click="saveChanges"
      >完成</text>
    </view>

    <!-- 任务编辑区域 -->
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

      <!-- 任务优先级 -->
      <view class="form-group priority-section">
        <text class="group-label">优先级</text>
        <view class="priority-options">
          <view 
            v-for="(priority, index) in priorities" 
            :key="index"
            class="priority-item"
            :class="{ active: selectedPriority === index }"
            @click="selectedPriority = index"
          >
            {{ priority }}
          </view>
        </view>
      </view>

      <!-- 截止日期 -->
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

    <!-- 删除按钮 -->
    <view class="delete-section" v-if="taskId">
      <button class="delete-btn" @click="confirmDelete">删除任务</button>
    </view>
  </view>
</template>

<script>
import { getTaskById, saveUpdatedTask, deleteTask } from '@/utils/storage.js'

export default {
  data() {
    return {
      taskId: null,
      taskName: '',
      selectedPriority: 1,
      dueDate: '',
      priorities: ['低', '中', '高'],
      isValidTask: false,
      originalTask: null,
      statusBarHeight: 0,
      today: new Date().toISOString().split('T')[0]
    }
  },

  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    this.taskId = options.id
    if (this.taskId) {
      this.loadTask()
    }
  },

  methods: {
    validateInput() {
      this.isValidTask = this.taskName.trim().length > 0
    },

    loadTask() {
      try {
        const task = getTaskById(this.taskId)
        if (task) {
          this.taskName = task.name
          this.selectedPriority = task.priority || 1
          this.dueDate = task.dueDate || ''
          this.originalTask = { ...task }
          this.validateInput()
        } else {
          this.handleLoadError()
        }
      } catch (error) {
        this.handleLoadError()
      }
    },

    handleLoadError() {
      uni.showToast({
        title: '加载任务失败',
        icon: 'none'
      })
      setTimeout(() => uni.navigateBack(), 1500)
    },

    formatDate(date) {
      if (!date) return ''
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      
      if (date === today) return '今天'
      if (date === tomorrow) return '明天'
      return date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2月$3日')
    },

    onDateChange(e) {
      this.dueDate = e.detail.value
    },

    handleBack() {
      if (this.hasChanges()) {
        uni.showModal({
          title: '提示',
          content: '是否放弃更改？',
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

    hasChanges() {
      return this.taskName !== this.originalTask?.name ||
             this.selectedPriority !== this.originalTask?.priority ||
             this.dueDate !== this.originalTask?.dueDate
    },

    saveChanges() {
      if (!this.isValidTask) return

      try {
        const updatedTask = {
          id: this.taskId,
          name: this.taskName.trim(),
          priority: this.selectedPriority,
          dueDate: this.dueDate,
          updateTime: new Date().toISOString()
        }
        
        saveUpdatedTask(updatedTask)
        
        uni.showToast({
          title: '已保存',
          icon: 'success'
        })
        setTimeout(() => uni.navigateBack(), 1500)
      } catch (error) {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },

    confirmDelete() {
      uni.showModal({
        title: '确认删除',
        content: '是否确定删除该任务？',
        success: (res) => {
          if (res.confirm) {
            this.handleDelete()
          }
        }
      })
    },

    handleDelete() {
      try {
        deleteTask(this.taskId)
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
        setTimeout(() => uni.navigateBack(), 1500)
      } catch (error) {
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
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

.delete-section {
  margin-top: 40px;
  padding: 0 16px;
}

.delete-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background-color: #FFFFFF;
  color: #FF3B30;
  border-radius: 10px;
  font-size: 17px;
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

  .delete-btn {
    background-color: #1C1C1E;
  }
}
</style>