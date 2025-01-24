<template>
  <view class="task-list">
    <!-- 分组显示任务 -->
    <template v-if="groupedTasks.length">
      <view 
        v-for="(group, index) in groupedTasks" 
        :key="index" 
        class="task-group"
      >
        <!-- 分组标题 -->
        <view class="group-header">
          <text class="group-title">{{ group.title }}</text>
          <text class="task-count">{{ group.tasks.length }}项</text>
        </view>

        <!-- 任务列表 -->
        <view class="task-items">
          <uni-swipe-action>
            <uni-swipe-action-item 
              v-for="task in group.tasks" 
              :key="task.id"
              :right-options="swipeOptions"
              @click="handleSwipeClick($event, task)"
            >
              <view 
                class="task-item"
                :class="{ 'task-completed': task.completed }"
                @tap="handleTaskTap(task)"
              >
                <!-- 任务状态勾选框 -->
                <view 
                  class="checkbox"
                  :class="{ checked: task.completed }"
                  @tap.stop="toggleCompletion(task)"
                >
                  <text v-if="task.completed" class="check-mark">✓</text>
                </view>

                <!-- 任务信息 -->
                <view class="task-content">
                  <view class="task-main">
                    <text class="task-name" :class="{ 'text-completed': task.completed }">
                      {{ task.name }}
                    </text>
                    <!-- 操作按钮 -->
                    <view class="task-actions">
                      <template v-if="!task.completed">
                        <text 
                          class="action-btn edit-btn"
                          @tap.stop="$emit('edit', task.id)"
                        >
                          编辑
                        </text>
                      </template>
                      <template v-else>
                        <text 
                          class="action-btn delete-btn"
                          @tap.stop="confirmDelete(task)"
                        >
                          删除
                        </text>
                      </template>
                    </view>
                  </view>
                  
                  <!-- 任务详情 -->
                  <view class="task-details" v-if="task.dueDate || task.priority !== undefined">
                    <text 
                      v-if="task.dueDate" 
                      class="due-date"
                      :class="{ 
                        'overdue': isOverdue(task.dueDate) && !task.completed,
                        'due-today': isDueToday(task.dueDate) && !task.completed
                      }"
                    >
                      {{ formatDueDate(task.dueDate) }}
                    </text>
                    
                    <view 
                      v-if="task.priority !== undefined" 
                      class="priority-tag"
                      :class="getPriorityClass(task.priority)"
                    >
                      {{ getPriorityLabel(task.priority) }}
                    </view>
                  </view>
                </view>
              </view>
            </uni-swipe-action-item>
          </uni-swipe-action>
        </view>
      </view>
    </template>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="empty-content">
        <image 
          src="/static/empty-tasks.png" 
          mode="aspectFit" 
          class="empty-image"
        />
        <text class="empty-text">暂无待办事项</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    tasks: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    groupedTasks() {
      const today = new Date().toISOString().split('T')[0]
      
      // 对任务进行分组
      const groups = [
        {
          title: '今日待办',
          tasks: this.tasks.filter(task => 
            !task.completed && 
            task.dueDate === today
          )
        },
        {
          title: '待办任务',
          tasks: this.tasks.filter(task => 
            !task.completed && 
            (!task.dueDate || task.dueDate > today)
          )
        },
        {
          title: '已完成',
          tasks: this.tasks.filter(task => task.completed)
        }
      ]

      // 只返回有任务的分组
      return groups.filter(group => group.tasks.length > 0)
    }
  },

  methods: {
    handleTaskTap(task) {
      this.$emit('view', task.id)
    },

    toggleCompletion(task) {
      this.$emit('toggle', task.id)
    },

    confirmDelete(task) {
      uni.showModal({
        title: '确认删除',
        content: `是否删除任务"${task.name}"？`,
        success: (res) => {
          if (res.confirm) {
            this.$emit('delete', task.id)
          }
        }
      })
    },

    isOverdue(dueDate) {
      return new Date(dueDate) < new Date().setHours(0, 0, 0, 0)
    },

    isDueToday(dueDate) {
      const today = new Date().toISOString().split('T')[0]
      return dueDate === today
    },

    formatDueDate(date) {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      
      if (date === today) return '今天'
      if (date === tomorrow) return '明天'
      return date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2月$3日')
    },

    getPriorityLabel(priority) {
      const labels = ['低', '中', '高']
      return labels[priority] || '中'
    },

    getPriorityClass(priority) {
      return {
        'priority-low': priority === 0,
        'priority-medium': priority === 1,
        'priority-high': priority === 2
      }
    }
  }
}
</script>

<style scoped>
.task-list {
  padding-bottom: env(safe-area-inset-bottom);
}

.task-group {
  margin-bottom: 24px;
}

.group-header {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  color: #3C3C43;
}

.task-count {
  font-size: 13px;
  color: #8E8E93;
}

.task-items {
  background-color: #FFFFFF;
  border-radius: 10px;
  margin: 0 16px;
  overflow: hidden;
}

.task-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 0.5px solid #E5E5EA;
}

.task-item:last-child {
  border-bottom: none;
}

.checkbox {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #C7C7CC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox.checked {
  background-color: #34C759;
  border-color: #34C759;
}

.check-mark {
  color: #FFFFFF;
  font-size: 14px;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
}

.task-name {
  font-size: 17px;
  color: #000000;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-completed {
  color: #8E8E93;
  text-decoration: line-through;
}

.task-details {
  display: flex;
  gap: 8px;
  align-items: center;
}

.due-date {
  font-size: 13px;
  color: #8E8E93;
}

.due-date.overdue {
  color: #FF3B30;
}

.due-date.due-today {
  color: #FF9500;
}

.priority-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.priority-low {
  background-color: #34C759;
  color: #FFFFFF;
}

.priority-medium {
  background-color: #FF9500;
  color: #FFFFFF;
}

.priority-high {
  background-color: #FF3B30;
  color: #FFFFFF;
}

.task-actions {
  flex-shrink: 0;
  min-width: 44px;
}

.action-btn {
  padding: 4px 8px;
  font-size: 15px;
  border-radius: 4px;
}

.edit-btn {
  color: #007AFF;
}

.delete-btn {
  color: #FF3B30;
}

.empty-state {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding-top: 45%;
  padding-bottom: env(safe-area-inset-bottom);
}

.empty-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-image {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 34rpx;
  color: #8E8E93;
  line-height: 1.4;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .group-title {
    color: #FFFFFF;
  }

  .task-items {
    background-color: #1C1C1E;
  }

  .task-item {
    border-bottom-color: #38383A;
  }

  .task-name {
    color: #FFFFFF;
  }

  .edit-btn {
    color: #0A84FF;
  }

  .delete-btn {
    color: #FF453A;
  }

  .empty-text {
    color: #98989D;
  }
}

/* 小屏幕适配 */
@media screen and (max-height: 667px) {
  .empty-state {
    padding-top: 40%;
  }
}
</style>