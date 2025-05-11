// API utility for grant drafting platform
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const fetchGrants = () => axios.get(`${API_BASE_URL}/admin/grants`).then(res => res.data);
export const fetchGrant = (grantId) => axios.get(`${API_BASE_URL}/admin/grants/${grantId}`).then(res => res.data);
export const fetchDraft = (orgId, grantId) => axios.get(`${API_BASE_URL}/drafts/${orgId}/${grantId}`).then(res => res.data);
export const saveDraft = (orgId, grantId, data) => axios.post(`${API_BASE_URL}/drafts/${orgId}/${grantId}`, data).then(res => res.data);
export const fetchOrg = (orgId) => axios.get(`${API_BASE_URL}/api/orgs/${orgId}`).then(res => res.data); 