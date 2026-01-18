<template>
  <div class="user-management-view">
    <div class="page-header">
      <h1>{{ $t('admin.userManagement') }}</h1>
      <el-button type="primary" @click="showAddUser">
        <el-icon><Plus /></el-icon>
        {{ $t('admin.addUser') }}
      </el-button>
    </div>

    <!-- Filters -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filter" class="filter-form">
        <el-form-item :label="$t('admin.userRole')">
          <el-select v-model="filter.role" :placeholder="$t('admin.filterByRole')" clearable @change="loadUsers">
            <el-option :label="$t('roles.endUser')" value="end_user" />
            <el-option :label="$t('roles.supportStaff')" value="support_staff" />
            <el-option :label="$t('roles.manager')" value="manager" />
            <el-option :label="$t('roles.admin')" value="admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('common.search')">
          <el-input
            v-model="filter.keyword"
            :placeholder="$t('admin.searchUsers')"
            clearable
            @keyup.enter="loadUsers"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="loadUsers">{{ $t('common.search') }}</el-button>
          <el-button @click="clearFilter">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Users Table -->
    <el-card class="table-card">
      <el-table :data="users" v-loading="loading">
        <el-table-column prop="name" :label="$t('common.name')" min-width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="36" :src="row.avatar">
                {{ getInitials(row.name) }}
              </el-avatar>
              <div class="user-details">
                <span class="user-name">{{ row.name }}</span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="role" :label="$t('admin.userRole')" width="140">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ formatRole(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="department" :label="$t('profile.department')" width="150" />
        
        <el-table-column prop="status" :label="$t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? $t('admin.active') : $t('admin.inactive') }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" :label="$t('profile.joined')" width="130">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column :label="$t('common.actions')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editUser(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button text type="warning" @click="changeRole(row)">
              <el-icon><UserFilled /></el-icon>
            </el-button>
            <el-button text type="danger" @click="deleteUser(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalCount"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <!-- Change Role Dialog -->
    <el-dialog v-model="roleDialogVisible" title="Change User Role" width="400px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="User">
          <span>{{ selectedUser?.name }}</span>
        </el-form-item>
        <el-form-item label="Role">
          <el-select v-model="roleForm.role" style="width: 100%">
            <el-option label="End User" value="end_user" />
            <el-option label="Support Staff" value="support_staff" />
            <el-option label="Manager" value="manager" />
            <el-option label="Administrator" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitRoleChange">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/stores'
import mockHandlers from '@/mock'
import type { User, PaginatedResponse } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/helpers'
import { Plus, Edit, UserFilled, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()
const uiStore = useUIStore()

const loading = ref(false)
const users = ref<User[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const filter = reactive({
  role: '',
  keyword: ''
})

const roleDialogVisible = ref(false)
const selectedUser = ref<User | null>(null)
const roleForm = reactive({
  role: ''
})

onMounted(async () => {
  uiStore.setBreadcrumbs([
    { label: t('nav.administration') },
    { label: t('nav.userManagement') }
  ])
  
  await loadUsers()
})

async function loadUsers() {
  loading.value = true
  
  try {
    const response = await mockHandlers.getUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: filter.keyword || undefined,
      role: filter.role || undefined
    })
    
    if (response.code === 200 && response.data) {
      const data = response.data as PaginatedResponse<User>
      users.value = data.items
      totalCount.value = data.total
    }
  } finally {
    loading.value = false
  }
}

function clearFilter() {
  filter.role = ''
  filter.keyword = ''
  currentPage.value = 1
  loadUsers()
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    end_user: 'End User',
    support_staff: 'Support Staff',
    manager: 'Manager',
    admin: 'Administrator'
  }
  return roleMap[role] || role
}

function getRoleType(role: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    end_user: 'info',
    support_staff: 'success',
    manager: 'warning',
    admin: 'danger'
  }
  return typeMap[role] || ''
}

function showAddUser() {
  ElMessage.info('Add user dialog would open here')
}

function editUser(user: User) {
  ElMessage.info(`Edit user: ${user.name}`)
}

function changeRole(user: User) {
  selectedUser.value = user
  roleForm.role = user.role
  roleDialogVisible.value = true
}

async function submitRoleChange() {
  if (!selectedUser.value) return
  
  try {
    const response = await mockHandlers.updateUserRole(selectedUser.value.id, roleForm.role)
    
    if (response.code === 200) {
      ElMessage.success('Role updated successfully')
      roleDialogVisible.value = false
      await loadUsers()
    } else {
      ElMessage.error(response.message)
    }
  } catch {
    ElMessage.error('Failed to update role')
  }
}

async function deleteUser(user: User) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete user "${user.name}"?`,
      'Delete User',
      { type: 'warning' }
    )
    
    ElMessage.success(`User ${user.name} deleted (mock)`)
  } catch {
    // User cancelled
  }
}
</script>

<style lang="scss" scoped>
.user-management-view {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }
  
  .filter-card {
    margin-bottom: 24px;
    
    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  
  .table-card {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .user-details {
        display: flex;
        flex-direction: column;
        
        .user-name {
          font-weight: 500;
        }
        
        .user-email {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
