export interface Image {
  id: number;
  url: string;
}

export const getImages = async () => {
  try {
    const res = await fetch("https://5f2f729312b1481b9b1b4eb9d00bc455.api.mockbin.io/unanalyzed-images");
    const data = await res.json() as Image[];
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export interface Category {
  id: number;
  name: string;
}

export const getCategories = async () => {
  try {
    const res = await fetch("https://f6fe9241e02b404689f62c585d0bd967.api.mockbin.io/categories");
    const data = await res.json() as Category[];
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export interface Annotation {
  categoryId: number;
  boundingBoxes: BoundingBox[];
}

export interface BoundingBox {
  topLeftX: number;
  topLeftY: number;
  width: number;
  height: number;
}

export interface AnnotationSubmission {
  imageId: number;
  annotations: Annotation[];
}

export const postAnnotation = async (data: AnnotationSubmission) => {
  try {
    await fetch("https://eb1b6f8bfab448df91c68bd442d6a968.api.mockbin.io/annotations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
