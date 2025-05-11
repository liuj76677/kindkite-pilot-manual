// API utility for grant drafting platform
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const fetchGrants = () => axios.get(`${API_BASE}/grants`).then(res => res.data);
export const fetchGrant = (grantId) => axios.get(`${API_BASE}/grants/${grantId}`).then(res => res.data);
export const fetchDraft = (orgId, grantId) => axios.get(`${API_BASE}/drafts/${orgId}/${grantId}`).then(res => res.data);
export const saveDraft = (orgId, grantId, data) => axios.post(`${API_BASE}/drafts/${orgId}/${grantId}`, data).then(res => res.data);
export const fetchOrg = (orgId) => axios.get(`${API_BASE}/orgs/${orgId}`).then(res => res.data); 