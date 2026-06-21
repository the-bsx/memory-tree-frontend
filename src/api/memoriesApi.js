import api from "./axiosInstance";

// Memory routes are mounted at /api/v1/ directly (not /api/v1/memories)
// per: app.use("/api/v1/", memoryRoutes)

// POST /events/:eventId/memories
export const createMemory = (eventId, payload) =>
  api.post(`/events/${eventId}/memories`, payload);

// GET /events/:eventId/memories
export const getAllMemoriesForEvent = (eventId) =>
  api.get(`/events/${eventId}/memories`);

// GET /memories/:id
export const getMemoryById = (id) => api.get(`/memories/${id}`);

// PUT /memories/:id
export const updateMemory = (id, payload) => api.put(`/memories/${id}`, payload);

// DELETE /memories/:id
export const deleteMemory = (id) => api.delete(`/memories/${id}`);
