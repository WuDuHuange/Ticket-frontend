<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1>{{ $t('dashboard.welcome') }}, {{ userName }}!</h1>
      <p>{{ $t('dashboard.subtitle') }}</p>
    </div>

    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">
            <el-icon :size="32"><Tickets /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalTickets }}</div>
            <div class="stat-label">{{ $t('admin.totalTickets') }}</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card-warning">
          <div class="stat-icon">
            <el-icon :size="32"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.openTickets }}</div>
            <div class="stat-label">{{ $t('dashboard.openTickets') }}</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card-success">
          <div class="stat-icon">
            <el-icon :size="32"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.resolvedTickets }}</div>
            <div class="stat-label">{{ $t('admin.resolved') }}</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card-info">
          <div class="stat-icon">
            <el-icon :size="32"><Reading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.kbArticles }}</div>
            <div class="stat-label">{{ $t('knowledge.articles') }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Quick Actions -->
    <el-card class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('dashboard.quickActions') }}</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-button type="primary" size="large" class="action-btn" @click="goTo('/tickets/create')">
            <el-icon><Plus /></el-icon>
            {{ $t('tickets.submitTicket') }}
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-button size="large" class="action-btn" @click="goTo('/my-tickets')">
            <el-icon><List /></el-icon>
            {{ $t('tickets.myTickets') }}
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-button size="large" class="action-btn" @click="goTo('/knowledge')">
            <el-icon><Reading /></el-icon>
            {{ $t('dashboard.browseKB') }}
          </el-button>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-button size="large" class="action-btn" @click="goTo('/faq')">
            <el-icon><QuestionFilled /></el-icon>
            {{ $t('knowledge.faq') }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Content Row -->
    <el-row :gutter="20" class="content-row">
      <!-- Recent Tickets -->
      <el-col :xs="24" :lg="14">
        <el-card class="recent-tickets-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.recentTickets') }}</span>
              <el-button text type="primary" @click="goTo('/my-tickets')">
                {{ $t('dashboard.viewAll') }}
              </el-button>
            </div>
          </template>
          
          <el-table :data="recentTickets" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" :label="$t('tickets.ticketId')" width="140" />
            <el-table-column prop="title" :label="$t('common.title')" min-width="200">
              <template #default="{ row }">
                <el-link type="primary" @click="goTo(`/tickets/${row.id}`)">
                  {{ row.title }}
                </el-link>
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
            <el-table-column prop="createdAt" :label="$t('common.created')" width="140">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Popular KB Articles -->
      <el-col :xs="24" :lg="10">
        <el-card class="kb-articles-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.popularArticles') }}</span>
              <el-button text type="primary" @click="goTo('/knowledge')">
                {{ $t('dashboard.viewAll') }}
              </el-button>
            </div>
          </template>
          
          <div class="article-list" v-loading="articlesLoading">
            <div
              v-for="article in popularArticles"
              :key="article.id"
              class="article-item"
              @click="goTo(`/knowledge/${article.id}`)"
            >
              <div class="article-title">{{ article.title }}</div>
              <div class="article-meta">
                <el-icon><View /></el-icon>
                {{ article.viewCount }} {{ $t('knowledge.viewCount') }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore, useTicketStore, useKnowledgeStore, useUIStore } from '@/stores'
import type { Ticket, KnowledgeArticle } from '@/types'
import {
  Tickets,
  Clock,
  CircleCheck,
  Reading,
  Plus,
  List,
  QuestionFilled,
  View
} from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const ticketStore = useTicketStore()
const knowledgeStore = useKnowledgeStore()
const uiStore = useUIStore()

const loading = ref(false)
const articlesLoading = ref(false)
const recentTickets = ref<Ticket[]>([])
const popularArticles = ref<KnowledgeArticle[]>([])

const userName = computed(() => userStore.user?.name?.split(' ')[0] || 'User')

const stats = computed(() => ({
  totalTickets: ticketStore.pagination.total,
  openTickets: ticketStore.openTickets.length,
  resolvedTickets: ticketStore.resolvedTickets.length,
  kbArticles: knowledgeStore.articles.length
}))

onMounted(async () => {
  uiStore.setBreadcrumbs([{ label: t('nav.dashboard') }])
  
  loading.value = true
  articlesLoading.value = true
  
  try {
    await ticketStore.fetchMyTickets(1, 5)
    recentTickets.value = ticketStore.tickets.slice(0, 5)
    
    await knowledgeStore.fetchPublicArticles(1, 5)
    popularArticles.value = knowledgeStore.articles
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
  } finally {
    loading.value = false
    articlesLoading.value = false
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

function getStatusType(status: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    new: 'info',
    assigned: '',
    in_progress: 'warning',
    pending_user: 'warning',
    resolved: 'success',
    closed: 'info',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

function getPriorityType(priority: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return typeMap[priority] || ''
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style lang="scss" scoped>
.dashboard {
  .welcome-section {
    margin-bottom: 24px;
    
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }
    
    p {
      margin: 0;
      color: #666;
    }
  }
  
  .stats-row {
    margin-bottom: 24px;
    
    .el-col {
      margin-bottom: 16px;
    }
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    
    .stat-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      margin-right: 16px;
    }
    
    .stat-content {
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
    
    &.stat-card-primary {
      .stat-icon {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }
      .stat-value { color: #409eff; }
    }
    
    &.stat-card-warning {
      .stat-icon {
        background: rgba(230, 162, 60, 0.1);
        color: #e6a23c;
      }
      .stat-value { color: #e6a23c; }
    }
    
    &.stat-card-success {
      .stat-icon {
        background: rgba(103, 194, 58, 0.1);
        color: #67c23a;
      }
      .stat-value { color: #67c23a; }
    }
    
    &.stat-card-info {
      .stat-icon {
        background: rgba(144, 147, 153, 0.1);
        color: #909399;
      }
      .stat-value { color: #909399; }
    }
  }
  
  .quick-actions-card {
    margin-bottom: 24px;
    
    .action-btn {
      width: 100%;
      height: 48px;
      margin-bottom: 12px;
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .content-row {
    .el-col {
      margin-bottom: 24px;
    }
  }
  
  .recent-tickets-card {
    height: 100%;
  }
  
  .kb-articles-card {
    height: 100%;
    
    .article-list {
      .article-item {
        padding: 12px 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #f5f7fa;
          margin: 0 -20px;
          padding-left: 20px;
          padding-right: 20px;
        }
        
        .article-title {
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
          
          &:hover {
            color: #409eff;
          }
        }
        
        .article-meta {
          font-size: 12px;
          color: #999;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}
</style>
