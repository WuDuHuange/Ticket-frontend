<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <el-icon :size="48" class="logo-icon">
          <Monitor />
        </el-icon>
        <h1 class="title">{{ $t('auth.systemTitle') }}</h1>
        <p class="subtitle">{{ $t('auth.systemSubtitle') }}</p>
      </div>
      
      <div class="sso-section">
        <p class="sso-info">
          {{ $t('auth.ssoInfo') }}
        </p>
        
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="sso-btn"
          @click="handleSSOLogin"
        >
          <el-icon><Key /></el-icon>
          {{ $t('auth.ssoLogin') }}
        </el-button>
        
        <div class="sso-note">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ $t('auth.ssoNote') }}</span>
        </div>
      </div>
      
      <!-- Demo Section - Only for development/testing -->
      <el-divider>{{ $t('auth.demoMode') }}</el-divider>
      
      <div class="demo-section">
        <p class="demo-info">
          {{ $t('auth.demoInfo') }}
        </p>
        <el-space wrap class="demo-accounts">
          <el-button 
            v-for="account in demoAccountList" 
            :key="account.type"
            :type="account.buttonType"
            :loading="loading && selectedDemo === account.type"
            @click="handleDemoLogin(account.type)"
          >
            <el-icon><User /></el-icon>
            {{ $t(`roles.${account.type}`) }}
          </el-button>
        </el-space>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { Monitor, Key, InfoFilled, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const selectedDemo = ref('')

interface DemoAccount {
  type: string
  label: string
  email: string
  buttonType: '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const demoAccountList: DemoAccount[] = [
  { type: 'user', label: 'End User', email: 'john.doe@university.edu', buttonType: '' },
  { type: 'staff', label: 'Support Staff', email: 'mike.tech@university.edu', buttonType: 'success' },
  { type: 'manager', label: 'Manager', email: 'david.manager@university.edu', buttonType: 'warning' },
  { type: 'admin', label: 'Admin', email: 'admin@university.edu', buttonType: 'danger' }
]

async function performLogin(email: string) {
  loading.value = true
  
  try {
    // SSO does not use passwords - authentication is handled by the SSO provider
    const result = await userStore.loginWithSSO(email)
    
    if (result.success) {
      ElMessage.success('Authentication successful!')
      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    } else {
      ElMessage.error(result.message || 'Authentication failed')
    }
  } catch {
    ElMessage.error('An error occurred during authentication')
  } finally {
    loading.value = false
    selectedDemo.value = ''
  }
}

function handleSSOLogin() {
  // In production, this would redirect to the SSO provider URL
  // Example: window.location.href = 'https://sso.university.edu/auth?redirect=' + encodeURIComponent(window.location.href)
  
  ElMessage.info('Redirecting to University SSO authentication portal...')
  
  // Simulate SSO redirect delay
  loading.value = true
  setTimeout(() => {
    // For demo, show account selection or login as default user
    ElMessage.warning('SSO redirect simulated. Please select a demo account below for testing.')
    loading.value = false
  }, 1500)
}

function handleDemoLogin(type: string) {
  selectedDemo.value = type
  const account = demoAccountList.find(a => a.type === type)
  if (account) {
    ElMessage.info(`Simulating SSO login as ${account.label}...`)
    performLogin(account.email)
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  .bg-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    
    &.bg-shape-1 {
      width: 600px;
      height: 600px;
      background: #fff;
      top: -200px;
      right: -100px;
    }
    
    &.bg-shape-2 {
      width: 400px;
      height: 400px;
      background: #fff;
      bottom: -150px;
      left: -100px;
    }
  }
}

.login-card {
  width: 460px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .logo-icon {
    color: #667eea;
  }
  
  .title {
    margin: 16px 0 8px;
    font-size: 28px;
    font-weight: 700;
    color: #333;
  }
  
  .subtitle {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.sso-section {
  text-align: center;
  
  .sso-info {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  
  .sso-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    
    .el-icon {
      margin-right: 8px;
    }
  }
  
  .sso-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    color: #999;
    font-size: 12px;
    
    .el-icon {
      color: #409eff;
    }
  }
}

.demo-section {
  text-align: center;
  
  .demo-info {
    color: #999;
    font-size: 12px;
    margin-bottom: 16px;
  }
  
  .demo-accounts {
    justify-content: center;
    
    .el-button {
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

:deep(.el-divider__text) {
  color: #999;
  font-size: 12px;
  background: #fff;
}
</style>
