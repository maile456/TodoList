// 存储键名常量
const STORAGE_KEYS = {
  TASKS: 'tasks',
  SETTINGS: 'settings'
}

/**
 * 获取所有任务
 * @returns {Array} 任务列表
 */
export function getTasks() {
  try {
    const tasks = uni.getStorageSync(STORAGE_KEYS.TASKS)
    return tasks ? JSON.parse(tasks) : []
  } catch (error) {
    console.error('获取任务列表失败:', error)
    return []
  }
}

/**
 * 保存任务
 * @param {Object} task 任务对象
 * @returns {boolean} 是否保存成功
 */
export function saveTask(task) {
  try {
    const tasks = getTasks()
    // 确保任务对象包含所有必要属性
    const newTask = {
      id: Date.now(),
      name: task.name,
      completed: false,
      priority: task.priority || 1, // 默认中等优先级
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      dueDate: task.dueDate || null,
      completedTime: null,
      notes: task.notes || ''
    }

    tasks.push(newTask)
    uni.setStorageSync(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    return true
  } catch (error) {
    console.error('保存任务失败:', error)
    return false
  }
}

/**
 * 根据ID获取任务
 * @param {number|string} id 任务ID
 * @returns {Object|null} 任务对象
 */
export function getTaskById(id) {
  try {
    const tasks = getTasks()
    return tasks.find(task => task.id === parseInt(id)) || null
  } catch (error) {
    console.error('获取任务详情失败:', error)
    return null
  }
}

/**
 * 更新任务
 * @param {Object} updatedTask 更新后的任务对象
 * @returns {boolean} 是否更新成功
 */
export function saveUpdatedTask(updatedTask) {
  try {
    const tasks = getTasks()
    const index = tasks.findIndex(task => task.id === parseInt(updatedTask.id))

    if (index !== -1) {
      // 保留原有任务的某些属性
      const originalTask = tasks[index]
      tasks[index] = {
        ...originalTask,
        ...updatedTask,
        updateTime: new Date().toISOString(),
        // 如果任务状态改变，更新完成时间
        completedTime: updatedTask.completed ?
          (originalTask.completed ? originalTask.completedTime : new Date().toISOString()) :
          null
      }

      uni.setStorageSync(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
      return true
    }
    return false
  } catch (error) {
    console.error('更新任务失败:', error)
    return false
  }
}

/**
 * 删除任务
 * @param {string} taskId 要删除的任务ID
 * @returns {boolean} 是否删除成功
 */
export function deleteTask(taskId) {
  try {
    // 获取当前所有任务
    const tasks = getTasks()
    // 过滤掉要删除的任务
    const updatedTasks = tasks.filter(task => task.id !== taskId)
    // 保存更新后的任务列表
    uni.setStorageSync(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks))
    return true
  } catch (error) {
    console.error('删除任务失败:', error)
    return false
  }
}

/**
 * 批量删除任务
 * @param {Array<number>} ids 任务ID数组
 * @returns {boolean} 是否删除成功
 */
export function deleteTasks(ids) {
  try {
    const tasks = getTasks()
    const filteredTasks = tasks.filter(task => !ids.includes(task.id))
    uni.setStorageSync(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks))
    return true
  } catch (error) {
    console.error('批量删除任务失败:', error)
    return false
  }
}

/**
 * 清空所有已完成的任务
 * @returns {boolean} 是否清空成功
 */
export function clearCompletedTasks() {
  try {
    const tasks = getTasks()
    const activeTasks = tasks.filter(task => !task.completed)
    uni.setStorageSync(STORAGE_KEYS.TASKS, JSON.stringify(activeTasks))
    return true
  } catch (error) {
    console.error('清空已完成任务失败:', error)
    return false
  }
}

/**
 * 获取应用设置
 * @returns {Object} 设置对象
 */
export function getSettings() {
  try {
    const settings = uni.getStorageSync(STORAGE_KEYS.SETTINGS)
    return settings ? JSON.parse(settings) : {
      defaultPriority: 1,
      showCompleted: true,
      sortBy: 'createTime',
      theme: 'light'
    }
  } catch (error) {
    console.error('获取设置失败:', error)
    return null
  }
}

/**
 * 保存应用设置
 * @param {Object} settings 设置对象
 * @returns {boolean} 是否保存成功
 */
export function saveSettings(settings) {
  try {
    uni.setStorageSync(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('保存设置失败:', error)
    return false
  }
}