import api from "./axiosInstance";

// All routes mounted at /api/v1/events, require Authorization header
// (already attached automatically by the axios interceptor)

// POST /events - multipart/form-data
export const createEvent = (formData) =>
  api.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET /events
export const getAllEvents = () => api.get("/events");

// GET /events/:id
export const getEventById = (id) => api.get(`/events/${id}`);

// PUT /events/:id - multipart/form-data, all fields optional
export const updateEvent = (id, formData) =>
  api.put(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// DELETE /events/:id
export const deleteEvent = (id) => api.delete(`/events/${id}`);
