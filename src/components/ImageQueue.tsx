import type { Image } from '../utils/API';

interface ImageQueueProps {
  images: Image[]
}
const ImageQueue: React.FC<ImageQueueProps> = ({ images }) => {
  return <div>
    <h2 className="text-left text-3xl">Next Images in Queue</h2>
    <div className='grid grid-cols-10 gap-5'>
      {images.map(image => {
        return <div key={`image-${image.id}`} className='bg-slate-500 flex justify-center items-center'>
            <img src={image.url} alt={`Image ${image.id}`} width={80} height={100}/>
          </div>
      })}
    </div>
  </div>
}

export default ImageQueue;
