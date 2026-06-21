import api from "./axiosInstance";

// Media routes are mounted at /api/v1 directly per: app.use("/api/v1", mediaRoutes)

// POST /memories/:memoryId/media - multipart/form-data, field name "media", max 5 files
export const uploadMedia = (memoryId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("media", file));
  return api.post(`/memories/${memoryId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// GET /memories/:memoryId/meida — NOTE: backend route has a typo ("meida" not "media").
// Matching it exactly as-is so this actually works against the current backend.
// Flag to backend dev: fix the typo in media.route.js, then update this one line.
export const getAllMediaForMemory = (memoryId) =>
  api.get(`/memories/${memoryId}/meida`);

// GET /media/:id
export const getMediaById = (id) => api.get(`/media/${id}`);

// PATCH /media/:id - { caption }
export const updateMediaCaption = (id, caption) =>
  api.patch(`/media/${id}`, { caption });

// DELETE /media/:id — hard delete, also removes from Cloudinary
export const deleteMedia = (id) => api.delete(`/media/${id}`);
