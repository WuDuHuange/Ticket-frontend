<template>
  <div class="dashboard">
    <!-- Stats Cards Row -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-danger">
          <div class="stat-content">
            <div class="stat-value">{{ stats.openTickets }}</div>
            <div class="stat-label">open</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="24" color="#f56c6c"><WarningFilled /></el-icon>
          </div>
          <div class="stat-change up">
            <el-icon><Top /></el-icon>
            5.2% {{ $t('dashboard.fromYesterday') }}
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-primary">
          <div class="stat-content">
            <div class="stat-value">{{ stats.inProgressTickets }}</div>
            <div class="stat-label">{{ $t('dashboard.inProgress') }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="24" color="#409eff"><Refresh /></el-icon>
          </div>
          <div class="stat-change down">
            <el-icon><Bottom /></el-icon>
            2.1% {{ $t('dashboard.fromYesterday') }}
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-warning">
          <div class="stat-content">
            <div class="stat-value">{{ stats.overdueTickets }}</div>
            <div class="stat-label">{{ $t('dashboard.overdue') }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="24" color="#e6a23c"><Clock /></el-icon>
          </div>
          <div class="stat-change up">
            <el-icon><Top /></el-icon>
            1.8% {{ $t('dashboard.fromYesterday') }}
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <div class="stat-card stat-card-success">
          <div class="stat-content">
            <div class="stat-value">{{ stats.resolvedToday }}</div>
            <div class="stat-label">{{ $t('dashboard.resolvedToday') }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="24" color="#67c23a"><CircleCheck /></el-icon>
          </div>
          <div class="stat-change up green">
            <el-icon><Top /></el-icon>
            12.4% {{ $t('dashboard.fromYesterday') }}
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Quick Actions + SLA Alert Row -->
    <el-row :gutter="20" class="actions-row">
      <el-col :xs="24" :lg="14">
        <!-- Quick Actions -->
        <div class="quick-actions-section">
          <h3 class="section-title">{{ $t('dashboard.quickActions') }}</h3>
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="action-card action-card-blue" @click="goTo('/tickets/create')">
                <el-icon :size="24"><Plus /></el-icon>
                <span>create</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="action-card action-card-green" @click="goTo('/knowledge')">
                <el-icon :size="24"><Search /></el-icon>
                <span>search knowledge</span>
              </div>
            </el-col>
            <el-col :span="12" v-if="isManager">
              <div class="action-card action-card-pink" @click="goTo('/admin/analytics')">
                <el-icon :size="24"><DataAnalysis /></el-icon>
                <span>analytics</span>
              </div>
            </el-col>
            <el-col :span="12" v-if="isAdmin">
              <div class="action-card action-card-purple" @click="goTo('/admin/users')">
                <el-icon :size="24"><UserFilled /></el-icon>
                <span>user management</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
      
      <!-- SLA Alert Panel -->
      <el-col :xs="24" :lg="10">
        <div class="sla-alert-section">
          <h3 class="section-title">{{ $t('dashboard.slaAlert') }}</h3>
          <div class="sla-alert-list">
            <div v-for="alert in slaAlerts" :key="alert.id" class="sla-alert-item">
              <div class="alert-icon" :class="alert.type">
                <el-icon v-if="alert.type === 'danger'"><WarningFilled /></el-icon>
                <el-icon v-else-if="alert.type === 'warning'"><Clock /></el-icon>
                <el-icon v-else><Bell /></el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-desc">{{ alert.description }}</div>
              </div>
              <div class="alert-time">{{ alert.time }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="14">
        <div class="chart-section">
          <div class="chart-header">
            <h3 class="section-title">{{ $t('dashboard.orderTrend') }}</h3>
            <div class="chart-tabs">
              <span class="tab" :class="{ active: trendTab === 'monthly' }" @click="trendTab = 'monthly'">{{ $t('dashboard.monthly') }}</span>
              <span class="tab" :class="{ active: trendTab === 'quarterly' }" @click="trendTab = 'quarterly'">{{ $t('dashboard.quarterly') }}</span>
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="trend-chart">
              <div v-for="(value, index) in trendData" :key="index" class="bar-wrapper">
                <div class="bar" :style="{ height: value + '%' }"></div>
                <span class="bar-label">{{ ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index] }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="10">
        <div class="chart-section">
          <div class="chart-header">
            <h3 class="section-title">{{ $t('dashboard.categoryDistribution') }}</h3>
            <span class="chart-subtitle">{{ $t('dashboard.thisWeek') }}</span>
          </div>
          <div class="chart-placeholder">
            <div class="pie-chart-placeholder">
              <div class="pie-chart"></div>
              <div class="pie-legend">
                <div class="legend-item" v-for="(item, index) in categoryData" :key="index">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.name }}</span>
                  <span class="legend-value">{{ item.value }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Latest Tickets Section -->
    <div class="latest-tickets-section">
      <div class="section-header">
        <h3 class="section-title">{{ $t('dashboard.latestTickets') }}</h3>
        <el-button text type="primary" @click="goTo('/tickets')">
          {{ $t('dashboard.viewAll') }}
        </el-button>
      </div>
      
      <el-table :data="recentTickets" style="width: 100%" v-loading="loading" class="latest-tickets-table">
        <el-table-column prop="id" :label="$t('dashboard.ticketNo')" width="160" />
        <el-table-column prop="requesterName" :label="$t('dashboard.customer')" width="120">
          <template #default>xxx</template>
        </el-table-column>
        <el-table-column prop="category" :label="$t('common.category')" min-width="140">
          <template #default="{ row }">
            {{ row.category?.name || 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="$t('common.priority')" width="100">
          <template #default="{ row }">
            {{ formatPriority(row.priority) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('common.status')" width="120">
          <template #default="{ row }">
            <span :class="['status-text', `status-${row.status}`]">
              {{ formatStatus(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dashboard.operation')" width="160">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="goTo(`/tickets/${row.id}`)">
              {{ $t('dashboard.detailed') }}
            </el-button>
            <el-button text type="primary" size="small" @click="goTo(`/tickets/${row.id}`)">
              {{ $t('dashboard.process') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore, useTicketStore, useKnowledgeStore, useUIStore } from '@/stores'
import type { Ticket } from '@/types'
import {
  Clock,
  CircleCheck,
  Plus,
  Search,
  DataAnalysis,
  UserFilled,
  WarningFilled,
  Bell,
  Top,
  Bottom,
  Refresh
} from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const ticketStore = useTicketStore()
const uiStore = useUIStore()

const loading = ref(false)
const recentTickets = ref<Ticket[]>([])
const trendTab = ref('monthly')

// Permission checks
const isAdmin = computed(() => userStore.isAdmin)
const isManager = computed(() => userStore.isManager)

// Mock SLA Alerts data
const slaAlerts = ref([
  {
    id: 1,
    type: 'danger',
    title: t('dashboard.emergencyResponseRisk'),
    description: `Work order #TKT-2026-01245 has 30 minutes remaining until the SLA response deadline.`,
    time: '2h ago'
  },
  {
    id: 2,
    type: 'warning',
    title: t('dashboard.expiringSoon'),
    description: `Work order #TKT-2026-01238 has 2 hours remaining until the resolution deadline.`,
    time: '4h ago'
  },
  {
    id: 3,
    type: 'info',
    title: t('dashboard.allocationReminder'),
    description: `Work order #TKT-2026-01231 has been awaiting assignment for over 1 hour.`,
    time: '6h ago'
  }
])

// Mock trend data
const trendData = ref([60, 75, 45, 80, 65, 90])

// Mock category data
const categoryData = ref([
  { name: 'Network', value: 35, color: '#409eff' },
  { name: 'Hardware', value: 25, color: '#67c23a' },
  { name: 'Software', value: 20, color: '#e6a23c' },
  { name: 'Account', value: 15, color: '#f56c6c' },
  { name: 'Other', value: 5, color: '#909399' }
])

const stats = computed(() => ({
  openTickets: ticketStore.tickets.filter(t => ['new', 'assigned'].includes(t.status)).length || 24,
  inProgressTickets: ticketStore.tickets.filter(t => t.status === 'in_progress').length || 18,
  overdueTickets: ticketStore.tickets.filter(t => t.slaBreached).length || 7,
  resolvedToday: ticketStore.resolvedTickets.length || 32
}))

onMounted(async () => {
  uiStore.setBreadcrumbs([{ label: t('nav.dashboard') }])
  
  loading.value = true
  
  try {
    await ticketStore.fetchMyTickets(1, 5)
    recentTickets.value = ticketStore.tickets.slice(0, 5)
  } finally {
    loading.value = false
  }
})

function goTo(path: string) {
  router.push(path)
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    new: t('tickets.statusNew'),
    assigned: t('tickets.statusAssigned'),
    in_progress: t('tickets.statusInProgress'),
    pending_user: t('tickets.statusPendingUser'),
    resolved: t('tickets.statusResolved'),
    closed: t('tickets.statusClosed'),
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;

  .section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .stats-row {
    margin-bottom: 20px;
    
    .el-col {
      margin-bottom: 16px;
    }
  }
  
  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    .stat-content {
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        line-height: 1.2;
        color: #333;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
      }
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stat-change {
      width: 100%;
      margin-top: 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      
      &.up { color: #f56c6c; }
      &.down { color: #67c23a; }
      &.up.green { color: #67c23a; }
    }
    
    &.stat-card-danger .stat-icon { background: rgba(245, 108, 108, 0.1); }
    &.stat-card-primary .stat-icon { background: rgba(64, 158, 255, 0.1); }
    &.stat-card-warning .stat-icon { background: rgba(230, 162, 60, 0.1); }
    &.stat-card-success .stat-icon { background: rgba(103, 194, 58, 0.1); }
  }

  .actions-row {
    margin-bottom: 20px;
  }

  .quick-actions-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;
    
    .section-title {
      margin-bottom: 16px;
    }
    
    .action-card {
      border-radius: 10px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-bottom: 16px;
      color: #fff;
      font-weight: 500;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &.action-card-blue { background: linear-gradient(135deg, #409eff, #66b1ff); }
      &.action-card-green { background: linear-gradient(135deg, #67c23a, #85ce61); }
      &.action-card-pink { background: linear-gradient(135deg, #f56c6c, #f89898); }
      &.action-card-purple { background: linear-gradient(135deg, #9c27b0, #ba68c8); }
    }
  }

  .sla-alert-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;
    
    .section-title {
      margin-bottom: 16px;
    }
    
    .sla-alert-list {
      .sla-alert-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid #eee;
        
        &:last-child {
          border-bottom: none;
        }
        
        .alert-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          
          &.danger {
            background: rgba(245, 108, 108, 0.1);
            color: #f56c6c;
          }
          &.warning {
            background: rgba(230, 162, 60, 0.1);
            color: #e6a23c;
          }
          &.info {
            background: rgba(64, 158, 255, 0.1);
            color: #409eff;
          }
        }
        
        .alert-content {
          flex: 1;
          min-width: 0;
          
          .alert-title {
            font-weight: 600;
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
          }
          
          .alert-desc {
            font-size: 12px;
            color: #666;
            line-height: 1.5;
          }
        }
        
        .alert-time {
          font-size: 12px;
          color: #999;
          flex-shrink: 0;
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .chart-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .chart-tabs {
        display: flex;
        gap: 16px;
        
        .tab {
          font-size: 14px;
          color: #999;
          cursor: pointer;
          padding: 4px 0;
          
          &.active {
            color: #409eff;
            border-bottom: 2px solid #409eff;
          }
        }
      }
      
      .chart-subtitle {
        font-size: 14px;
        color: #999;
      }
    }
    
    .chart-placeholder {
      height: 200px;
      
      .trend-chart {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        height: 100%;
        padding: 0 20px;
        
        .bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          
          .bar {
            width: 40px;
            background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
            border-radius: 4px 4px 0 0;
            transition: height 0.3s;
          }
          
          .bar-label {
            font-size: 12px;
            color: #999;
          }
        }
      }
      
      .pie-chart-placeholder {
        display: flex;
        align-items: center;
        gap: 30px;
        height: 100%;
        
        .pie-chart {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: conic-gradient(
            #409eff 0% 35%,
            #67c23a 35% 60%,
            #e6a23c 60% 80%,
            #f56c6c 80% 95%,
            #909399 95% 100%
          );
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: #fff;
            border-radius: 50%;
          }
        }
        
        .pie-legend {
          flex: 1;
          
          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            
            .legend-color {
              width: 12px;
              height: 12px;
              border-radius: 3px;
            }
            
            .legend-label {
              flex: 1;
              font-size: 13px;
              color: #666;
            }
            
            .legend-value {
              font-size: 13px;
              font-weight: 600;
              color: #333;
            }
          }
        }
      }
    }
  }

  .latest-tickets-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .latest-tickets-table {
      .status-text {
        font-weight: 500;
        
        &.status-new { color: #409eff; }
        &.status-assigned { color: #e6a23c; }
        &.status-in_progress { color: #409eff; }
        &.status-pending_user { color: #e6a23c; }
        &.status-resolved { color: #67c23a; }
        &.status-closed { color: #909399; }
      }
    }
  }
}
</style>
