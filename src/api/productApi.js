import API from './axios';

// 🔹 Get all products
export const fetchProduct = async () => {
  const response = await API.get("/products/");
  return response.data;
};
// productApi.js
export const getAllProducts = async () => {
  const response = await API.get("/all-products/");
  return response.data;
};

// Add Product without image
export const addProduct = async (newProduct) => {
  const payload = { ...newProduct, image: null }; // Image अभी skip
  const response = await API.post("/products/", payload);
  return response.data;
};

// Update Product without image
export const updateProduct = async ({ productId, updatedData }) => {
  const response = await API.put(`/products/${productId}/`, updatedData);
  return response.data;
};


// ✅ केवल is_active update करने के लिए PATCH
export const toggleProductStatus = async ({ productId, isActive }) => {
  const response = await API.patch(`/products/${productId}/`, {
    is_active: isActive,
  });
  return response.data;
};

// ✅ Inactive products fetch करने के लिए
export const fetchInactiveProducts = async () => {
  const response = await API.get("/products/inactive/");
  return response.data;
};

// 🔹 Delete a product
export const deleteProduct = async (productId) => {
  const response = await API.delete(`/products/${productId}/`);
  return response.data;
};


export const downloadProductTemplate = () => {
  return API.get("/products/bulk-template/", { responseType: "blob" });
};

export const bulkUploadProducts = (formData) => {
  return API.post("/products/bulk-upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 🔹 Upload product image
export const uploadProductImage = async ({ productId, imageFile }) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await API.post(`/products/${productId}/upload_image/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// 🔹 Upload product image2
export const uploadProductImage2 = async ({ productId, imageFile }) => {
  const formData = new FormData();
  formData.append("image2", imageFile);

  const response = await API.post(`/products/${productId}/upload_image2/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
