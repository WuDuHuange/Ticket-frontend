import { http } from './client'
import type { 
  User, 
  Ticket, 
  TicketCreateDTO, 
  TicketFilter,
  TicketComment,
  KnowledgeArticle,
  ArticleCreateDTO,
  ArticleFilter,
  Team,
  TicketAnalytics,
  AgentPerformance,
  KnowledgeAnalytics,
  SLAConfig,
  AuditLog,
  PaginatedResponse,
  TicketCategory
} from '@/types'

// ==================== Auth API ====================
export const authApi = {
  // SSO Login
  login(credentials: { email: string; password: string }) {
    return http.post<{ token: string; user: User }>('/auth/login', credentials)
  },
  
  // SSO Callback
  ssoCallback(code: string) {
    return http.post<{ token: string; user: User }>('/auth/sso/callback', { code })
  },
  
  // Logout
  logout() {
    return http.post<void>('/auth/logout')
  },
  
  // Get current user info
  getCurrentUser() {
    return http.get<User>('/auth/me')
  },
  
  // Refresh token
  refreshToken() {
    return http.post<{ token: string }>('/auth/refresh')
  }
}

// ==================== User API ====================
export const userApi = {
  // Get user list (admin only)
  getUsers(params: { page: number; pageSize: number; keyword?: string; role?: string }) {
    return http.get<PaginatedResponse<User>>('/users', { params })
  },
  
  // Get user by ID
  getUserById(id: string) {
    return http.get<User>(`/users/${id}`)
  },
  
  // Update user
  updateUser(id: string, data: Partial<User>) {
    return http.put<User>(`/users/${id}`, data)
  },
  
  // Update user role
  updateUserRole(id: string, role: string) {
    return http.patch<User>(`/users/${id}/role`, { role })
  },
  
  // Deactivate user
  deactivateUser(id: string) {
    return http.patch<User>(`/users/${id}/deactivate`)
  },
  
  // Activate user
  activateUser(id: string) {
    return http.patch<User>(`/users/${id}/activate`)
  },
  
  // Update profile
  updateProfile(data: { name?: string; phone?: string; department?: string }) {
    return http.put<User>('/users/profile', data)
  }
}

// ==================== Ticket API ====================
export const ticketApi = {
  // Get ticket list
  getTickets(params: { 
    page: number
    pageSize: number
    filter?: TicketFilter 
  }) {
    return http.get<PaginatedResponse<Ticket>>('/tickets', { params })
  },
  
  // Get my tickets (end user)
  getMyTickets(params: { page: number; pageSize: number; status?: string }) {
    return http.get<PaginatedResponse<Ticket>>('/tickets/my', { params })
  },
  
  // Get assigned tickets (support staff)
  getAssignedTickets(params: { page: number; pageSize: number; status?: string }) {
    return http.get<PaginatedResponse<Ticket>>('/tickets/assigned', { params })
  },
  
  // Get team tickets
  getTeamTickets(teamId: string, params: { page: number; pageSize: number }) {
    return http.get<PaginatedResponse<Ticket>>(`/teams/${teamId}/tickets`, { params })
  },
  
  // Get ticket by ID
  getTicketById(id: string) {
    return http.get<Ticket>(`/tickets/${id}`)
  },
  
  // Create ticket
  createTicket(data: TicketCreateDTO) {
    return http.post<Ticket>('/tickets', data)
  },
  
  // Upload ticket attachment
  uploadAttachment(ticketId: string, formData: FormData) {
    return http.upload<{ id: string; url: string; filename: string }>(
      `/tickets/${ticketId}/attachments`, 
      formData
    )
  },
  
  // Update ticket status
  updateTicketStatus(id: string, status: string, comment?: string) {
    return http.patch<Ticket>(`/tickets/${id}/status`, { status, comment })
  },
  
  // Update ticket priority
  updateTicketPriority(id: string, priority: string) {
    return http.patch<Ticket>(`/tickets/${id}/priority`, { priority })
  },
  
  // Assign ticket
  assignTicket(id: string, assigneeId: string) {
    return http.patch<Ticket>(`/tickets/${id}/assign`, { assigneeId })
  },
  
  // Assign ticket to team
  assignTicketToTeam(id: string, teamId: string) {
    return http.patch<Ticket>(`/tickets/${id}/assign-team`, { teamId })
  },
  
  // Add comment
  addComment(ticketId: string, data: { content: string; isInternal: boolean }) {
    return http.post<TicketComment>(`/tickets/${ticketId}/comments`, data)
  },
  
  // Resolve ticket
  resolveTicket(id: string, resolution: string) {
    return http.patch<Ticket>(`/tickets/${id}/resolve`, { resolution })
  },
  
  // Close ticket
  closeTicket(id: string) {
    return http.patch<Ticket>(`/tickets/${id}/close`)
  },
  
  // Reopen ticket
  reopenTicket(id: string, reason: string) {
    return http.patch<Ticket>(`/tickets/${id}/reopen`, { reason })
  },
  
  // Submit satisfaction feedback
  submitFeedback(id: string, data: { rating: number; comment?: string }) {
    return http.post<void>(`/tickets/${id}/feedback`, data)
  },
  
  // Get categories
  getCategories() {
    return http.get<TicketCategory[]>('/tickets/categories')
  }
}

// ==================== Knowledge Base API ====================
export const knowledgeApi = {
  // Get article list
  getArticles(params: {
    page: number
    pageSize: number
    filter?: ArticleFilter
  }) {
    return http.get<PaginatedResponse<KnowledgeArticle>>('/knowledge/articles', { params })
  },
  
  // Get published articles (for end users)
  getPublishedArticles(params: { 
    page: number
    pageSize: number
    keyword?: string
    category?: string
    tags?: string[]
    sortBy?: 'relevance' | 'updated'
  }) {
    return http.get<PaginatedResponse<KnowledgeArticle>>('/knowledge/articles/published', { params })
  },
  
  // Get FAQ articles
  getFAQArticles() {
    return http.get<KnowledgeArticle[]>('/knowledge/articles/faq')
  },
  
  // Get suggested articles (during ticket creation)
  getSuggestedArticles(query: string) {
    return http.get<KnowledgeArticle[]>('/knowledge/articles/suggest', { params: { query } })
  },
  
  // Get article by ID
  getArticleById(id: string) {
    return http.get<KnowledgeArticle>(`/knowledge/articles/${id}`)
  },
  
  // Create article
  createArticle(data: ArticleCreateDTO) {
    return http.post<KnowledgeArticle>('/knowledge/articles', data)
  },
  
  // Update article
  updateArticle(id: string, data: Partial<ArticleCreateDTO>) {
    return http.put<KnowledgeArticle>(`/knowledge/articles/${id}`, data)
  },
  
  // Publish article
  publishArticle(id: string) {
    return http.patch<KnowledgeArticle>(`/knowledge/articles/${id}/publish`)
  },
  
  // Archive article
  archiveArticle(id: string) {
    return http.patch<KnowledgeArticle>(`/knowledge/articles/${id}/archive`)
  },
  
  // Delete article
  deleteArticle(id: string) {
    return http.delete<void>(`/knowledge/articles/${id}`)
  },
  
  // Mark article as helpful
  markHelpful(id: string, helpful: boolean) {
    return http.post<void>(`/knowledge/articles/${id}/helpful`, { helpful })
  },
  
  // Get categories
  getCategories() {
    return http.get<string[]>('/knowledge/categories')
  },
  
  // Get popular tags
  getTags() {
    return http.get<string[]>('/knowledge/tags')
  }
}

// ==================== Team API ====================
export const teamApi = {
  // Get team list
  getTeams() {
    return http.get<Team[]>('/teams')
  },
  
  // Get team by ID
  getTeamById(id: string) {
    return http.get<Team>(`/teams/${id}`)
  },
  
  // Create team
  createTeam(data: { name: string; description?: string }) {
    return http.post<Team>('/teams', data)
  },
  
  // Update team
  updateTeam(id: string, data: { name?: string; description?: string }) {
    return http.put<Team>(`/teams/${id}`, data)
  },
  
  // Delete team
  deleteTeam(id: string) {
    return http.delete<void>(`/teams/${id}`)
  },
  
  // Add team member
  addTeamMember(teamId: string, userId: string, role: 'leader' | 'member') {
    return http.post<void>(`/teams/${teamId}/members`, { userId, role })
  },
  
  // Remove team member
  removeTeamMember(teamId: string, userId: string) {
    return http.delete<void>(`/teams/${teamId}/members/${userId}`)
  },
  
  // Update member role
  updateMemberRole(teamId: string, userId: string, role: 'leader' | 'member') {
    return http.patch<void>(`/teams/${teamId}/members/${userId}`, { role })
  }
}

// ==================== Analytics API ====================
export const analyticsApi = {
  // Get ticket analytics
  getTicketAnalytics(params: { dateFrom?: string; dateTo?: string }) {
    return http.get<TicketAnalytics>('/analytics/tickets', { params })
  },
  
  // Get agent performance
  getAgentPerformance(params: { 
    dateFrom?: string
    dateTo?: string
    teamId?: string 
  }) {
    return http.get<AgentPerformance[]>('/analytics/agents', { params })
  },
  
  // Get knowledge analytics
  getKnowledgeAnalytics(params: { dateFrom?: string; dateTo?: string }) {
    return http.get<KnowledgeAnalytics>('/analytics/knowledge', { params })
  },
  
  // Get SLA compliance report
  getSLACompliance(params: {
    dateFrom?: string
    dateTo?: string
    priority?: string
    category?: string
  }) {
    return http.get<{
      complianceRate: number
      breachedTickets: number
      escalatedTickets: number
      byPriority: Record<string, number>
    }>('/analytics/sla', { params })
  },
  
  // Export report
  exportReport(type: string, params: { dateFrom?: string; dateTo?: string; format: 'csv' | 'xlsx' }) {
    return http.download(`/analytics/export/${type}`, `report_${type}_${Date.now()}.${params.format}`, { params })
  }
}

// ==================== SLA API ====================
export const slaApi = {
  // Get SLA configurations
  getSLAConfigs() {
    return http.get<SLAConfig[]>('/sla/configs')
  },
  
  // Update SLA configuration
  updateSLAConfig(id: string, data: Partial<SLAConfig>) {
    return http.put<SLAConfig>(`/sla/configs/${id}`, data)
  }
}

// ==================== Audit Log API ====================
export const auditApi = {
  // Get audit logs
  getAuditLogs(params: {
    page: number
    pageSize: number
    userId?: string
    action?: string
    dateFrom?: string
    dateTo?: string
  }) {
    return http.get<PaginatedResponse<AuditLog>>('/audit/logs', { params })
  }
}

// ==================== System API ====================
export const systemApi = {
  // Get system health
  getHealth() {
    return http.get<{ status: string; version: string }>('/system/health')
  },
  
  // Get system settings
  getSettings() {
    return http.get<Record<string, unknown>>('/system/settings')
  },
  
  // Update system settings
  updateSettings(settings: Record<string, unknown>) {
    return http.put<void>('/system/settings', settings)
  }
}
