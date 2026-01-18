<template>
  <div class="ticket-list-view">
    <div class="page-header">
      <h1>{{ $t('tickets.allTickets') }}</h1>
      <el-button type="primary" @click="goToCreate">
        <el-icon><Plus /></el-icon>
        {{ $t('dashboard.newTicket') }}
      </el-button>
    </div>

    <!-- Stats -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-item" :class="{ active: currentTab === 'all' }" @click="setTab('all')">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">{{ $t('tickets.allTickets') }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item" :class="{ active: currentTab === 'new' }" @click="setTab('new')">
          <div class="stat-value">{{ newCount }}</div>
          <div class="stat-label">{{ $t('tickets.statusNew') }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item" :class="{ active: currentTab === 'in_progress' }" @click="setTab('in_progress')">
          <div class="stat-value">{{ inProgressCount }}</div>
          <div class="stat-label">{{ $t('tickets.statusInProgress') }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item" :class="{ active: currentTab === 'resolved' }" @click="setTab('resolved')">
          <div class="stat-value">{{ resolvedCount }}</div>
          <div class="stat-label">{{ $t('tickets.statusResolved') }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- Filters -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filter" class="filter-form">
        <el-form-item :label="$t('common.status')">
          <el-select v-model="filter.status" :placeholder="$t('tickets.filterByStatus')" clearable multiple collapse-tags>
            <el-option :label="$t('tickets.statusNew')" value="new" />
            <el-option :label="$t('tickets.statusAssigned')" value="assigned" />
            <el-option :label="$t('tickets.statusInProgress')" value="in_progress" />
            <el-option :label="$t('tickets.statusPendingUser')" value="pending_user" />
            <el-option :label="$t('tickets.statusResolved')" value="resolved" />
            <el-option :label="$t('tickets.statusClosed')" value="closed" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('common.priority')">
          <el-select v-model="filter.priority" :placeholder="$t('tickets.filterByPriority')" clearable multiple collapse-tags>
            <el-option :label="$t('tickets.priorityLow')" value="low" />
            <el-option :label="$t('tickets.priorityMedium')" value="medium" />
            <el-option :label="$t('tickets.priorityHigh')" value="high" />
            <el-option :label="$t('tickets.priorityUrgent')" value="urgent" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('common.search')">
          <el-input
            v-model="filter.keyword"
            :placeholder="$t('tickets.searchTickets')"
            clearable
            @keyup.enter="handleFilter"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleFilter">{{ $t('common.search') }}</el-button>
          <el-button @click="clearFilter">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Tickets Table -->
    <el-card class="table-card">
      <el-table
        :data="tickets"
        v-loading="loading"
        style="width: 100%"
        @row-click="viewTicket"
        row-class-name="clickable-row"
      >
        <el-table-column prop="id" :label="$t('tickets.ticketId')" width="150" />
        
        <el-table-column prop="title" :label="$t('common.title')" min-width="200">
          <template #default="{ row }">
            <div class="ticket-title">
              <span>{{ row.title }}</span>
              <el-tag v-if="row.slaBreached" type="danger" size="small">SLA</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="requesterName" :label="$t('tickets.submittedBy')" width="150" />
        
        <el-table-column prop="category" :label="$t('common.category')" width="130">
          <template #default="{ row }">
            {{ row.category?.name || 'N/A' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" :label="$t('common.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="priority" :label="$t('common.priority')" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small" effect="plain">
              {{ formatPriority(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="assigneeName" :label="$t('tickets.assignedTo')" width="130">
          <template #default="{ row }">
            {{ row.assigneeName || $t('tickets.unassigned') }}
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" :label="$t('common.created')" width="130">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalCount"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore, useUIStore } from '@/stores'
import { Plus } from '@element-plus/icons-vue'
import {
  formatDate,
  getStatusType,
  getPriorityType,
  formatPriority
} from '@/utils/helpers'

const router = useRouter()
const { t } = useI18n()
const ticketStore = useTicketStore()
const uiStore = useUIStore()

const loading = computed(() => ticketStore.loading)
const tickets = computed(() => ticketStore.tickets)

const currentPage = ref(1)
const pageSize = ref(10)
const currentTab = ref('all')

const totalCount = computed(() => ticketStore.pagination.total)
const newCount = computed(() => ticketStore.newTickets.length)
const inProgressCount = computed(() => ticketStore.tickets.filter(t => t.status === 'in_progress').length)
const resolvedCount = computed(() => ticketStore.resolvedTickets.length)

const filter = reactive({
  status: [] as string[],
  priority: [] as string[],
  keyword: ''
})

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    new: t('tickets.statusNew'),
    assigned: t('tickets.statusAssigned'),
    in_progress: t('tickets.statusInProgress'),
    pending_user: t('tickets.statusPendingUser'),
    resolved: t('tickets.statusResolved'),
    closed: t('tickets.statusClosed')
  }
  return statusMap[status] || status
}

onMounted(async () => {
  uiStore.setBreadcrumbs([
    { label: t('nav.dashboard'), path: '/' },
    { label: t('nav.allTickets') }
  ])
  
  await loadTickets()
})

function goToCreate() {
  router.push('/tickets/create')
}

function viewTicket(row: { id: string }) {
  router.push(`/tickets/${row.id}`)
}

function setTab(tab: string) {
  currentTab.value = tab
  
  if (tab === 'all') {
    filter.status = []
  } else if (tab === 'new') {
    filter.status = ['new']
  } else if (tab === 'in_progress') {
    filter.status = ['assigned', 'in_progress', 'pending_user']
  } else if (tab === 'resolved') {
    filter.status = ['resolved', 'closed']
  }
  
  handleFilter()
}

async function loadTickets() {
  const filterParams: Record<string, unknown> = {}
  
  if (filter.status.length > 0) {
    filterParams.status = filter.status
  }
  if (filter.priority.length > 0) {
    filterParams.priority = filter.priority
  }
  if (filter.keyword) {
    filterParams.keyword = filter.keyword
  }
  
  await ticketStore.fetchTickets(currentPage.value, pageSize.value, filterParams)
}

async function handleFilter() {
  currentPage.value = 1
  await loadTickets()
}

async function clearFilter() {
  filter.status = []
  filter.priority = []
  filter.keyword = ''
  currentTab.value = 'all'
  currentPage.value = 1
  await loadTickets()
}

async function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  await loadTickets()
}

async function handlePageChange(page: number) {
  currentPage.value = page
  await loadTickets()
}
</script>

<style lang="scss" scoped>
.ticket-list-view {
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
  
  .stats-row {
    margin-bottom: 24px;
    
    .stat-item {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      &.active {
        border-color: #409eff;
        background: #ecf5ff;
      }
      
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #333;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
      }
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
    :deep(.clickable-row) {
      cursor: pointer;
      
      &:hover {
        background-color: #f5f7fa;
      }
    }
    
    .ticket-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
