// api/categories.js
export const fetchCategories = (userId) => API.get(`/categories?userId=${userId}`);
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.patch(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);