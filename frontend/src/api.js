const API_BASE = 'http://localhost:8000/api';

export const api = {
  // Auth & Behavioral
  async login(payload) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async stepUpVerify(payload) {
    const res = await fetch(`${API_BASE}/auth/step-up-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`);
    return res.json();
  },

  // UPI Payments & Interception
  async getPaymentPresets() {
    const res = await fetch(`${API_BASE}/payment/presets`);
    return res.json();
  },

  async checkPaymentRisk(payload) {
    const res = await fetch(`${API_BASE}/payment/check-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async executePayment(payload) {
    const res = await fetch(`${API_BASE}/payment/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Voice Clone / Deepfake Analyzer
  async getVoiceScenarios() {
    const res = await fetch(`${API_BASE}/voice/scenarios`);
    return res.json();
  },

  async analyzeVoiceScenario(scenarioId) {
    const res = await fetch(`${API_BASE}/voice/analyze-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId }),
    });
    return res.json();
  },

  async analyzeVoiceUpload(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/voice/analyze-upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async toggleFreeze(action, durationMinutes = 15, reason = 'Voice-Clone Scam Detected') {
    const res = await fetch(`${API_BASE}/voice/toggle-freeze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        freeze_duration_minutes: durationMinutes,
        reason,
      }),
    });
    return res.json();
  },

  async getFreezeStatus() {
    const res = await fetch(`${API_BASE}/voice/freeze-status`);
    return res.json();
  },

  // Dashboard & Threats
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return res.json();
  },

  async getBlacklist() {
    const res = await fetch(`${API_BASE}/dashboard/blacklist`);
    return res.json();
  },

  async reportVpa(payload) {
    const res = await fetch(`${API_BASE}/dashboard/report-vpa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
