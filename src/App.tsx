import { useState, useEffect } from "react"
import "./App.css"

import { getImages, getCategories, postAnnotation, type Image, type Category, type BoundingBox } from "./utils/API";
import ImageCanvas from "./components/ImageCanvas";
import CategoryForm from "./components/CategoryForm";
import ImageQueue from "./components/ImageQueue";

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [annotations, setAnnotations] = useState<BoundingBox[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        const [newImages, newCategories] = await Promise.all([getImages(), getCategories()]);
        setImages(newImages);
        setCategories(newCategories);
      } catch (err) {
        console.log(err);
        setImages([]);
        setCategories([]);
      }
    };
    initialize();
  }, []);

  const handleSubmit = async (categoryId: number) => {
    try {
      await postAnnotation({
        imageId: images[0]?.id,
        annotations: [{
          categoryId,
          boundingBoxes: annotations
        }]
      });
      if (images.length > 1) {
        setImages(images.slice(1));
      } else {
        setImages([]);
      }
      setAnnotations([]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong with the annotation, try again later");
    }
  }

  const handleDiscard = async () => {
    try {
      await postAnnotation({
        imageId: images[0]?.id,
        annotations: []
      });
      if (images.length > 1) {
        setImages(images.slice(1));
      } else {
        setImages([]);
      }
      setAnnotations([]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong when discarding this image, try again later");
    }
  }

  const handleNewAnnotation = (boundingBox: BoundingBox | null) => {
    if (boundingBox) {
      setAnnotations([boundingBox])
    } else {
      setAnnotations([]);
    }
  }

  return (
    <main>
      {error ? (<div className="text-red-500">{error}</div>) : null}
      <h1 className="text-left">Image Analyzer</h1>
      <div className="grid grid-cols-5">
        <div className="col-span-3">
          <ImageCanvas imageURL={images[0]?.url || ""} onAnnotation={handleNewAnnotation}/>
        </div>
        <div className="col-span-2">
          <CategoryForm categories={categories} onSubmit={handleSubmit} onDiscard={handleDiscard} hasBoundingBox={annotations.length > 0}/>
        </div>
      </div>
      <ImageQueue images={images.slice(0, 10)}/>
    </main>
  )
}

export default App
